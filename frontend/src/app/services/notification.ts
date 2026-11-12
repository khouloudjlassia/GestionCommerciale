import { Injectable, signal } from '@angular/core';

export interface Notice {
  type: 'success' | 'error';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // Message affiché en haut de page (null = aucun message)
  readonly notice = signal<Notice | null>(null);
  private timer?: ReturnType<typeof setTimeout>;

  success(text: string): void {
    this.show('success', text);
  }

  error(text: string): void {
    this.show('error', text);
  }


  /** Transforme une erreur HTTP de l'API en message lisible. */
  fromHttp(err: any): string {
    const body = err?.error;
    if (typeof body === 'string' && body) return body;
    if (body?.message) return body.message;
    if (body?.errors) return (Object.values(body.errors).flat() as string[]).join(' ');
    if (body?.detail) return body.detail; // ✅ Affiche le message d'erreur précis du Back-end
    if (body?.title) return body.title;
    return 'Une erreur est survenue. Vérifiez que l’API est lancée.';
  }
  private show(type: Notice['type'], text: string): void {
    clearTimeout(this.timer);
    this.notice.set({ type, text });
    // Le message disparaît après 4 secondes
    this.timer = setTimeout(() => this.notice.set(null), 4000);
  }
}