import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;

@Injectable({ providedIn: 'root' })
export class AnswerService {
  constructor(private http: HttpClient) {}

  answer(question: string): Observable<string> {
    return this.http.post(
      `${API_BASE_URL}/answer`,
      { question },
      {
        responseType: 'text', // aqui continua como 'text'
        observe: 'body'       // 👈 esse carinha aqui resolve o problema do overload!
      } as {
        responseType: 'text';
        observe: 'body';
      }
    );
  }
}
