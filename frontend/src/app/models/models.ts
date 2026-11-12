/* ========== CLIENTS ========== */

// Données reçues de l'API (ClientDto)
export interface ClientModel {
  id: number;
  lastName: string;
  firstName: string;          // prénom ou raison sociale
  email: string;
  phone: string | null;
  address: string | null;
  createdAt: string;          // DateTime C# -> texte ISO en JSON
}

// Données envoyées à l'API pour créer ou modifier un client
export interface ClientPayload {
  lastName: string;
  firstName: string;
  email: string;
  phone: string | null;
  address: string | null;
}

/* ========== PRODUITS ========== */

// Données reçues de l'API (ProductDto)
export interface ProductModel {
  id: number;
  reference: string;
  name: string;
  description: string | null;
  unitPriceHT: number;
  stockQuantity: number;
  imageUrl: string | null;
  createdAt: string;
}

// Données envoyées à l'API (ProductCreateDto)
export interface ProductPayload {
  reference: string;
  name: string;
  description: string | null;
  unitPriceHT: number;
  stockQuantity: number;
  imageUrl: string | null;
}

/* ========== COMMANDES ========== */

export type OrderStatus = 'Draft' | 'Validated' | 'Cancelled';

// Ligne reçue de l'API (OrderLineDto)
export interface OrderLineModel {
  productId: number;
  productReference: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

// Commande reçue de l'API (OrderDto)
export interface OrderModel {
  id: number;
  orderNumber: string;
  clientId: number;
  clientName: string;
  orderDate: string;
  status: OrderStatus;
  totalHT: number;
  totalTTC: number;
  lines: OrderLineModel[];
}

// Ligne envoyée à l'API (OrderLineCreateDto) : seulement produit + quantité
export interface OrderLinePayload {
  productId: number;
  quantity: number;
}

// Commande envoyée à l'API (OrderCreateDto)
export interface OrderPayload {
  clientId: number;
  lines: OrderLinePayload[];
}

// Libellés affichés à l'écran pour chaque statut
export const STATUS_LABELS: Record<OrderStatus, string> = {
  Draft: 'Brouillon',
  Validated: 'Validée',
  Cancelled: 'Annulée',
};