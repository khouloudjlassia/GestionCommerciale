import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { filter, skip } from 'rxjs';
import { OrderService } from '../../services/order';
import { NotificationService } from '../../services/notification';
import { ConfirmService } from '../../services/confirm';
import { OrderModel } from '../../models/models';
import { statusInfo, isDraft } from '../../core/order-helpers';

@Component({
  selector: 'app-order-list',
  imports: [RouterLink, RouterOutlet, DatePipe, DecimalPipe],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
})
export class OrderList implements OnInit {
  private router = inject(Router);
  private orderService = inject(OrderService);
  private notifier = inject(NotificationService);
  private confirmService = inject(ConfirmService);

  private readonly pageSize = 5;
  readonly statusInfo = statusInfo;
  readonly isDraft = isDraft;

  orders = signal<OrderModel[]>([]);
  loading = signal(true);
  search = signal('');
  page = signal(1);

  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.orders();
    return this.orders().filter(o =>
      [o.orderNumber, o.clientName].some(v => v.toLowerCase().includes(term))
    );
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  constructor() {
    // Recharge la liste quand une popup se ferme (retour sur /orders)
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed()
      )
      .subscribe(e => {
        if (e.urlAfterRedirects === '/orders') this.load();
      });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.orderService.getAll().subscribe({
      next: data => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.notifier.error(this.notifier.fromHttp(err));
        this.loading.set(false);
      },
    });
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.page.set(page);
  }

  async remove(order: OrderModel): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Supprimer la commande',
      message: `Voulez-vous vraiment supprimer la commande ${order.orderNumber} ?`, confirmLabel: 'Supprimer',
    });
    if (!confirmed) return;

    this.orderService.delete(order.id).subscribe({
      next: () => {
        this.notifier.success('Commande supprimée.');
        this.load();
      },
      error: err => this.notifier.error(this.notifier.fromHttp(err)),
    });
  }
}