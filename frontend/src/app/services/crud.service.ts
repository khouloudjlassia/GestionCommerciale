import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';

/**
 * Service de base pour les appels REST.
 * TModel   = données reçues de l'API
 * TPayload = données envoyées à l'API (création / modification)
 */
export abstract class CrudService<TModel, TPayload> {
  protected http = inject(HttpClient);

  // Nom de la ressource dans l'URL (ex : 'clients')
  protected abstract resource: string;

  protected get url(): string {
    return `${API_URL}/${this.resource}`;
  }

  getAll(): Observable<TModel[]> {
    return this.http.get<TModel[]>(this.url);
  }

  getById(id: number): Observable<TModel> {
    return this.http.get<TModel>(`${this.url}/${id}`);
  }

  create(payload: TPayload): Observable<TModel> {
    return this.http.post<TModel>(this.url, payload);
  }

  update(id: number, payload: TPayload): Observable<unknown> {
    return this.http.put(`${this.url}/${id}`, payload);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }
}