import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;

@Injectable({ providedIn: 'root' })
export class ExameService {
  private apiUrl = `${API_BASE_URL}/exames`;

  constructor(private http: HttpClient) {}

  criarExame(dados: any): Observable<any> {
    return this.http.post(this.apiUrl, dados);
  }

  atualizarExame(id: number, dados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dados);
  }

  buscarExamePorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
