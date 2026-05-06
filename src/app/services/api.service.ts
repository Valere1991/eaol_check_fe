import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  baseUrl = 'http://localhost:8000';

  get<T>(path: string): Observable<T> {
    return from(this.headers()).pipe(
      switchMap((headers) => this.http.get<T>(`${this.baseUrl}${path}`, { headers }))
    );
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return from(this.headers()).pipe(
      switchMap((headers) => this.http.post<T>(`${this.baseUrl}${path}`, body, { headers }))
    );
  }

  private async headers(): Promise<HttpHeaders> {
    const token = await this.auth.token();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }
}
