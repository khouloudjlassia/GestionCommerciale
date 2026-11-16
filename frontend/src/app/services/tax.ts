import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudService } from './crud.service';
import { TaxModel } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TaxService extends CrudService<TaxModel, Partial<TaxModel>> {
  protected resource = 'taxes';
}

