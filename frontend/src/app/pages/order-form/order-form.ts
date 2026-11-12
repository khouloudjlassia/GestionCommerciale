import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { OrderService } from '../../services/order';
import { ClientService } from '../../services/client';
import { ProductService } from '../../services/product';
import { NotificationService } from '../../services/notification';
import { ClientModel, ProductModel, OrderPayload } from '../../models/models';
import { VAT_RATE } from '../../core/order-helpers';

interface LineDraft {
  productId: number | null;
  quantity: number;
}

@Component({
  selector: 'app-order-form',
  imports: [DecimalPipe],
  templateUrl: './order-form.html',
  styleUrl: './order-form.css',
  host: { '(document:keydown.escape)': 'close()' },
})
export class OrderForm implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private clientService = inject(ClientService);
  private productService = inject(ProductService);
  private notifier = inject(NotificationService);

  orderId = signal<number | null>(null);       // null = création
  orderNumber = signal<string | null>(null);   // numéro lisible ex: CMD-20261112-001
  clients = signal<ClientModel[]>([]);
  products = signal<ProductModel[]>([]);
  clientId = signal<number | null>(null);
  lines = signal<LineDraft[]>([]);
  saving = signal(false);
  submitted = signal(false);

  // Totaux recalculés automatiquement
  totalHT = computed(() => this.lines().reduce((sum, l) => sum + this.lineTotal(l), 0));
  vat = computed(() => this.totalHT() * VAT_RATE);
  totalTTC = computed(() => this.totalHT() + this.vat());

  problems = computed(() => {
    const list: string[] = [];
    if (this.clientId() === null) list.push('Sélectionnez un client.');
    if (this.lines().length === 0) list.push('Ajoutez au moins un produit.');
    if (this.lines().some(l => this.lineError(l))) list.push('Corrigez les lignes de produits.');
    return list;
  });

  // 1 Client, 2 Produits, 3 Récapitulatif
  step = computed(() => {
    if (this.clientId() === null) return 1;
    if (this.lines().length === 0 || this.lines().some(l => this.lineError(l))) return 2;
    return 3;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    forkJoin({
      clients: this.clientService.getAll(),
      products: this.productService.getAll(),
      order: id ? this.orderService.getById(Number(id)) : of(null),
    }).subscribe({
      next: ({ clients, products, order }) => {
        this.clients.set(clients);
        this.products.set(products);
        if (order) {
          this.orderId.set(order.id);
          this.orderNumber.set(order.orderNumber);
          this.clientId.set(order.clientId);
          this.lines.set(order.lines.map(l => ({ productId: l.productId, quantity: l.quantity })));
        }
      },
      error: err => {
        this.notifier.error(this.notifier.fromHttp(err));
        this.close();
      },
    });
  }

  productOf(line: LineDraft): ProductModel | undefined {
    return this.products().find(p => p.id === line.productId);
  }

  unitPrice(line: LineDraft): number {
    return this.productOf(line)?.unitPriceHT ?? 0;
  }

  lineTotal(line: LineDraft): number {
    return this.unitPrice(line) * line.quantity;
  }

  /** Message d'erreur d'une ligne, ou null si elle est valide. */
  lineError(line: LineDraft): string | null {
    if (line.productId === null) return 'Choisissez un produit.';
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) return 'La quantité doit être supérieure à 0.';
    const product = this.productOf(line);
    if (product && line.quantity > product.stockQuantity) return `Stock disponible : ${product.stockQuantity}.`;
    return null;
  }

  addLine(): void {
    this.lines.update(lines => [...lines, { productId: null, quantity: 1 }]);
  }

  removeLine(index: number): void {
    this.lines.update(lines => lines.filter((_, i) => i !== index));
  }

  private patchLine(index: number, patch: Partial<LineDraft>): void {
    this.lines.update(lines => lines.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  setProduct(index: number, value: string): void {
    this.patchLine(index, { productId: Number(value) || null });
  }

  setQuantity(index: number, value: string): void {
    this.patchLine(index, { quantity: Number(value) });
  }

  setClient(value: string): void {
    this.clientId.set(Number(value) || null);
  }

  close(): void {
    this.router.navigate(['/orders']);
  }

  /** Enregistre la commande (brouillon), puis la valide si demandé. */
  save(validateAfter: boolean): void {
    this.submitted.set(true);
    if (this.problems().length > 0) return;

    const payload: OrderPayload = {
      clientId: this.clientId()!,
      lines: this.lines().map(l => ({ productId: l.productId!, quantity: l.quantity })),
    };

    const id = this.orderId();
    const save$ = id
      ? this.orderService.update(id, payload).pipe(map(() => id))
      : this.orderService.create(payload).pipe(map(order => order.id));

    this.saving.set(true);
    save$
      .pipe(switchMap(savedId => (validateAfter ? this.orderService.validate(savedId) : of(null))))
      .subscribe({
        next: () => {
          this.notifier.success(validateAfter ? 'Commande validée.' : 'Commande enregistrée en brouillon.');
          this.close();
        },
        error: err => {
          this.notifier.error(this.notifier.fromHttp(err));
          this.saving.set(false);
        },
      });
  }
}