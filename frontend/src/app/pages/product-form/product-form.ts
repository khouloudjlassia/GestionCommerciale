import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product';
import { TaxService } from '../../services/tax';
import { NotificationService } from '../../services/notification';
import { ProductPayload, TaxModel } from '../../models/models';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
  host: { '(document:keydown.escape)': 'close()' },
})
export class ProductForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private taxService = inject(TaxService);
  private notifier = inject(NotificationService);

  // null = création, nombre = modification
  productId = signal<number | null>(null);
  saving = signal(false);
  previewImage = signal<string | null>(null);
  taxes = signal<TaxModel[]>([]);
  // Affichée en lecture seule : la date est fixée par l'API, jamais envoyée
  createdAt = signal(new Date().toISOString().slice(0, 10));

  form = this.fb.group({
    reference:     ['', [Validators.required, Validators.maxLength(50)]],
    name:          ['', [Validators.required, Validators.maxLength(150)]],
    description:   ['', [Validators.maxLength(500)]],
    unitPriceHT:   [0,  [Validators.required, Validators.min(0)]],
    stockQuantity: [0,  [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    taxId:         [<number | null>1],
    imageUrl:      [''],
  });

  ngOnInit(): void {
    // Charger la liste des taxes
    this.taxService.getAll().subscribe({
      next: data => this.taxes.set(data),
      error: err => console.error('Erreur chargement taxes', err),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.productId.set(Number(id));
    this.productService.getById(Number(id)).subscribe({
      next: product => {
        this.form.patchValue({
          reference: product.reference,
          name: product.name,
          description: product.description ?? '',
          unitPriceHT: product.unitPriceHT,
          stockQuantity: product.stockQuantity,
          taxId: product.taxId,
          imageUrl: product.imageUrl ?? '',
        });
        if (product.imageUrl) {
          this.previewImage.set(product.imageUrl);
        }
        this.createdAt.set(product.createdAt.slice(0, 10));
      },
      error: err => {
        this.notifier.error(this.notifier.fromHttp(err));
        this.router.navigate(['/products']);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.previewImage.set(base64);
      this.form.patchValue({ imageUrl: base64 });
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.previewImage.set(null);
    this.form.patchValue({ imageUrl: '' });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: ProductPayload = {
      reference: value.reference!,
      name: value.name!,
      unitPriceHT: Number(value.unitPriceHT) || 0,
      stockQuantity: Number(value.stockQuantity) || 0,
      taxId: value.taxId ? Number(value.taxId) : null,
      description: value.description || null,   // l'API attend null pour un champ vide
      imageUrl: value.imageUrl?.trim() || null,
    };

    const id = this.productId();
    const request = id
      ? this.productService.update(id, payload)
      : this.productService.create(payload);

    this.saving.set(true);
    request.subscribe({
      next: () => {
        this.notifier.success(id ? 'Produit modifié.' : 'Produit créé.');
        this.router.navigate(['/products']);
      },
      error: err => {
        this.notifier.error(this.notifier.fromHttp(err));
        this.saving.set(false);
      },
    });
  }
  close(): void {                                                  // nouvelle méthode
    this.router.navigate(['/products']);
  }
}