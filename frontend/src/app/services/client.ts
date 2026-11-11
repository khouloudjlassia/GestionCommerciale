import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { ClientModel, ClientPayload } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ClientService extends CrudService<ClientModel, ClientPayload> {
  protected resource = 'clients';
}