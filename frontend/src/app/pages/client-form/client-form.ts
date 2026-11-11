import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../services/client';
import { NotificationService } from '../../services/notification';
import { ClientPayload } from '../../models/models';

@Component({
  selector: 'app-client-form',
  imports: [ReactiveFormsModule],
  templateUrl: './client-form.html',
  styleUrl: './client-form.css',
  // La touche Échap ferme la fenêtre
  host: { '(document:keydown.escape)': 'close()' },
})
export class ClientForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);
  private notifier = inject(NotificationService);

  // null = création, nombre = modification
  clientId = signal<number | null>(null);
  saving = signal(false);
  // Affichée en lecture seule : la date est fixée par l'API, jamais envoyée
  createdAt = signal(new Date().toISOString().slice(0, 10));

  form = this.fb.nonNullable.group({
    lastName:  ['', [Validators.required, Validators.maxLength(100)]],
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    email:     ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    phone:     ['', [Validators.required, Validators.pattern(/^[0-9+\s]{8,15}$/)]],
    address:   ['', [Validators.maxLength(250)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.clientId.set(Number(id));
    this.clientService.getById(Number(id)).subscribe({
      next: client => {
        this.form.patchValue({
          lastName: client.lastName,
          firstName: client.firstName,
          email: client.email,
          phone: client.phone ?? '',
          address: client.address ?? '',
        });
        this.createdAt.set(client.createdAt.slice(0, 10));
      },
      error: err => this.notifier.error(this.notifier.fromHttp(err)),
    });
  }

  close(): void {
    this.router.navigate(['/clients']);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: ClientPayload = {
      ...value,
      address: value.address || null,   // l'API attend null pour un champ vide
    };

    const id = this.clientId();
    const request = id
      ? this.clientService.update(id, payload)
      : this.clientService.create(payload);

    this.saving.set(true);
    request.subscribe({
      next: () => {
        this.notifier.success(id ? 'Client modifié.' : 'Client créé.');
        this.close();
      },
      error: err => {
        this.notifier.error(this.notifier.fromHttp(err));
        this.saving.set(false);
      },
    });
  }
}