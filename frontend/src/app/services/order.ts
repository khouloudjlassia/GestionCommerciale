import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudService } from './crud.service';
import { OrderModel, OrderPayload } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OrderService extends CrudService<OrderModel, OrderPayload> {
  protected resource = 'orders';

  // POST /api/orders/{id}/validate : valide la commande et met à jour le stock
  validate(id: number): Observable<unknown> {
    return this.http.post(`${this.url}/${id}/validate`, {});

  }
  cancel(id: number): Observable<unknown> {
    return this.http.post(`${this.url}/${id}/cancel`, {});
  }
}