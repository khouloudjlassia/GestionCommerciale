import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product';
import { NotificationService } from '../../services/notification';
import { ProductModel } from '../../models/models';

@Component({
  selector: 'app-product-detail',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
  host: { '(document:keydown.escape)': 'close()' },
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private notifier = inject(NotificationService);

  product = signal<ProductModel | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe({
      next: product => this.product.set(product),
      error: err => {
        this.notifier.error(this.notifier.fromHttp(err));
        this.close();
      },
    });
  }

  close(): void {
    this.router.navigate(['/products']);
  }

  edit(product: ProductModel): void {
    this.router.navigate(['/products', product.id, 'edit']);
  }
}