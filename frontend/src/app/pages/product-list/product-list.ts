import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { filter, skip } from 'rxjs';
import { ProductService } from '../../services/product';
import { NotificationService } from '../../services/notification';
import { ConfirmService } from '../../services/confirm';
import { ProductModel } from '../../models/models';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink, RouterOutlet, DatePipe, DecimalPipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private router = inject(Router);
  private productService = inject(ProductService);
  private notifier = inject(NotificationService);
  private confirmService = inject(ConfirmService);

  products = signal<ProductModel[]>([]);
  loading = signal(true);
  search = signal('');

  // Produits filtrés par la recherche (référence, nom, description)
  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.products();
    return this.products().filter(p =>
      [p.reference, p.name, p.description ?? '']
        .some(value => value.toLowerCase().includes(term))
    );
  });

  constructor() {
    // Recharge la liste quand une popup se ferme (retour sur /products).
    // skip(1) ignore la navigation qui a créé la page (ngOnInit charge déjà).
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed()
      )
      .subscribe(e => {
        if (e.urlAfterRedirects === '/products') this.load();
      });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.productService.getAll().subscribe({
      next: data => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.notifier.error(this.notifier.fromHttp(err));
        this.loading.set(false);
      },
    });
  }

  async remove(product: ProductModel): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Supprimer le produit',
      message: `Voulez-vous vraiment supprimer « ${product.name} » ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
    });
    if (!confirmed) return;

    this.productService.delete(product.id).subscribe({
      next: () => {
        this.notifier.success('Produit supprimé.');
        this.load();
      },
      error: err => this.notifier.error(this.notifier.fromHttp(err)),
    });
  }
}