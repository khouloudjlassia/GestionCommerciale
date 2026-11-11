import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ClientService } from '../../services/client';
import { NotificationService } from '../../services/notification';
import { ClientModel } from '../../models/models';
import { ConfirmService } from '../../services/confirm';
@Component({
  selector: 'app-client-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './client-list.html',
  styleUrl: './client-list.css',
})
export class ClientList implements OnInit {
  private clientService = inject(ClientService);
  private notifier = inject(NotificationService);
private confirmService = inject(ConfirmService); 
  private readonly pageSize = 5;

  clients = signal<ClientModel[]>([]);
  loading = signal(true);
  search = signal('');
  page = signal(1);

  // Clients filtrés par la recherche (nom, prénom, email, téléphone)
  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.clients();
    return this.clients().filter(c =>
      [c.lastName, c.firstName, c.email, c.phone ?? '']
        .some(value => value.toLowerCase().includes(term))
    );
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));

  // Clients de la page courante
  paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.clientService.getAll().subscribe({
      next: data => {
        this.clients.set(data);
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

  async remove(client: ClientModel): Promise<void> {
  const confirmed = await this.confirmService.ask({
    title: 'Supprimer le client',
    message: `Voulez-vous vraiment supprimer ${client.lastName} ${client.firstName} ? Cette action est irréversible.`,
    confirmLabel: 'Supprimer',
  });
  if (!confirmed) return;

  this.clientService.delete(client.id).subscribe({
    next: () => {
      this.notifier.success('Client supprimé.');
      this.load();
    },
    error: err => this.notifier.error(this.notifier.fromHttp(err)),
  });
}}