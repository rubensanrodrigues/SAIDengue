// src/app/services/api/session.service.ts
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { API_URL } from './config/api-url.token'; 
import { sessionLoginUser } from '../protected/lib/session/session.util';

@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(
    private http: HttpClient,
    @Inject(API_URL) private baseUrl: string
  ) {}

  login(user: { username: string; password: string }): Observable<boolean> {
    return this.http.post<{ data: { token: string } }>(
      `${this.baseUrl}/login`,
      user
    ).pipe(
      map(res => {
        sessionLoginUser(user.username, res.data.token);
        return true;
      }),
      catchError(() => of(false)) // caso erro, retorna false
    );
  }  
}
