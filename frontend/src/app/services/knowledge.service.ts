import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;

@Injectable({
  providedIn: 'root'
})
export class KnowledgeService {
  private apiUrl = `${API_BASE_URL}/knowledges`;

  constructor(private http: HttpClient) {}

  // Listar todos os conhecimentos
  getKnowledges(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  // Buscar por ID
  getKnowledgeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Criar novo
  createKnowledge(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  // Atualizar existente
  updateKnowledge(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}`, data);
  }

  // Deletar
  deleteKnowledge(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
