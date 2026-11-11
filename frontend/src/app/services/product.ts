import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { ProductModel, ProductPayload } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductService extends CrudService<ProductModel, ProductPayload> {
  protected resource = 'products';
}