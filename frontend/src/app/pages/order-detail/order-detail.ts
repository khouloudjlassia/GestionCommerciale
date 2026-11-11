import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { OrderService } from '../../services/order';
import { NotificationService } from '../../services/notification';
import { ConfirmService } from '../../services/confirm';
import { OrderModel } from '../../models/models';
import { statusInfo, isDraft } from '../../core/order-helpers';

@Component({
  selector: 'app-order-detail',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
  host: { '(document:keydown.escape)': 'close()' },
})
export class OrderDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private notifier = inject(NotificationService);
  private confirmService = inject(ConfirmService);

  readonly statusInfo = statusInfo;
  readonly isDraft = isDraft;

  order = signal<OrderModel | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getById(id).subscribe({
      next: order => this.order.set(order),
      error: err => {
        this.notifier.error(this.notifier.fromHttp(err));
        this.close();
      },
    });
  }

  close(): void {
    this.router.navigate(['/orders']);
  }

  edit(order: OrderModel): void {
    this.router.navigate(['/orders', order.id, 'edit']);
  }

  async validate(order: OrderModel): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Valider la commande',
      message: `La validation de ${order.orderNumber} met à jour le stock des produits. Continuer ?`,
      confirmLabel: 'Valider',
    });
    if (!confirmed) return;

    this.orderService.validate(order.id).subscribe({
      next: () => {
        this.notifier.success('Commande validée, stock mis à jour.');
        this.close();
      },
      error: err => this.notifier.error(this.notifier.fromHttp(err)),
    });
  }
}