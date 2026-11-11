import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product';
import { NotificationService } from '../../services/notification';
import { ProductPayload } from '../../models/models';

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
  private notifier = inject(NotificationService);

  // null = création, nombre = modification
  productId = signal<number | null>(null);
  saving = signal(false);
  // Affichée en lecture seule : la date est fixée par l'API, jamais envoyée
  createdAt = signal(new Date().toISOString().slice(0, 10));

  form = this.fb.nonNullable.group({
    reference:     ['', [Validators.required, Validators.maxLength(50)]],
    name:          ['', [Validators.required, Validators.maxLength(150)]],
    description:   ['', [Validators.maxLength(500)]],
    unitPriceHT:   [0,  [Validators.required, Validators.min(0)]],
    stockQuantity: [0,  [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
  });

  ngOnInit(): void {
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
        });
        this.createdAt.set(product.createdAt.slice(0, 10));
      },
      error: err => {
        this.notifier.error(this.notifier.fromHttp(err));
        this.router.navigate(['/products']);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: ProductPayload = {
      ...value,
      description: value.description || null,   // l'API attend null pour un champ vide
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