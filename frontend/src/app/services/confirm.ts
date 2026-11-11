import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;   // texte du bouton de confirmation
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  // Options de la fenêtre affichée (null = fenêtre fermée)
  readonly options = signal<ConfirmOptions | null>(null);
  private resolver?: (confirmed: boolean) => void;

  /** Ouvre la fenêtre et retourne true si l'utilisateur confirme. */
  ask(options: ConfirmOptions): Promise<boolean> {
    this.resolver?.(false);   // ferme une éventuelle fenêtre déjà ouverte
    this.options.set(options);
    return new Promise<boolean>(resolve => (this.resolver = resolve));
  }

  answer(confirmed: boolean): void {
    this.options.set(null);
    this.resolver?.(confirmed);
    this.resolver = undefined;
  }
}