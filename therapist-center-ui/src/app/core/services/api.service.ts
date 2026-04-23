import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api`;

  constructor(private readonly http: HttpClient) {}

  get<T>(url: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        httpParams = httpParams.set(key, String(value));
      });
    }
    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}/${url}`, { params: httpParams })
      .pipe(map((r) => r.data));
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.baseUrl}/${url}`, body)
      .pipe(map((r) => r.data));
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.baseUrl}/${url}`, body)
      .pipe(map((r) => r.data));
  }

  patch<T>(url: string, body: unknown): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(`${this.baseUrl}/${url}`, body)
      .pipe(map((r) => r.data));
  }

  delete<T>(url: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(`${this.baseUrl}/${url}`)
      .pipe(map((r) => r.data));
  }
}
