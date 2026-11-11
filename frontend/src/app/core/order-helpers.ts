// TVA fixe du cahier des charges (§4). Le back-end reste la référence pour les totaux.
export const VAT_RATE = 0.19;

// Valeurs de l'enum C# OrderStatus : 0 = Draft, 1 = Validated, 2 = Cancelled.
const STATUSES: Record<string, { label: string; css: string }> = {
  '0': { label: 'Brouillon', css: 'badge-draft' },
  '1': { label: 'Validée',   css: 'badge-validated' },
  '2': { label: 'Annulée',   css: 'badge-cancelled' },
  draft:     { label: 'Brouillon', css: 'badge-draft' },
  validated: { label: 'Validée',   css: 'badge-validated' },
  cancelled: { label: 'Annulée',   css: 'badge-cancelled' },
};

export function statusInfo(status: string | number) {
  return STATUSES[String(status).toLowerCase()] ?? { label: String(status), css: 'badge-draft' };
}

export function isDraft(status: string | number): boolean {
  return statusInfo(status).css === 'badge-draft';
}