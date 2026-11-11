import { Routes } from '@angular/router';
import { ClientList } from './pages/client-list/client-list';
import { ClientForm } from './pages/client-form/client-form';
import { ProductList } from './pages/product-list/product-list';
import { ProductForm } from './pages/product-form/product-form';
import { ProductDetail } from './pages/product-detail/product-detail';   // ← nouveau
import { OrderList } from './pages/order-list/order-list';
import { OrderForm } from './pages/order-form/order-form';
import { OrderDetail } from './pages/order-detail/order-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'orders', pathMatch: 'full' },

  { path: 'clients', component: ClientList },
  { path: 'clients/new', component: ClientForm },
  { path: 'clients/:id/edit', component: ClientForm },

  // Produits : la liste reste affichée, les popups s'ouvrent dans son <router-outlet />
  {
    path: 'products',
    component: ProductList,
    children: [
      { path: 'new', component: ProductForm },
      { path: ':id/edit', component: ProductForm },
      { path: ':id', component: ProductDetail },   // toujours après 'new' et ':id/edit'
    ],
  },

  { path: 'orders', component: OrderList },
  { path: 'orders/new', component: OrderForm },
  { path: 'orders/:id/edit', component: OrderForm },
  { path: 'orders/:id', component: OrderDetail },
];