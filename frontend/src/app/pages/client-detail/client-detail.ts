import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../services/client';
import { NotificationService } from '../../services/notification';
import { ClientModel } from '../../models/models';

@Component({
  selector: 'app-client-detail',
  imports: [],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.css',
  host: { '(document:keydown.escape)': 'close()' },
})
export class ClientDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);
  private notifier = inject(NotificationService);

  client = signal<ClientModel | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.clientService.getById(id).subscribe({
      next: client => this.client.set(client),
      error: err => {
        this.notifier.error(this.notifier.fromHttp(err));
        this.close();
      },
    });
  }

  close(): void {
    this.router.navigate(['/clients']);
  }

  edit(client: ClientModel): void {
    this.router.navigate(['/clients', client.id, 'edit']);
  }
}