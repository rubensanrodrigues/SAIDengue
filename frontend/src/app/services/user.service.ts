import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${API_BASE_URL}/users`;

  constructor(private http: HttpClient) {}

  // Método para obter a lista de usuários
  getUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Método para excluir um usuário
  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${userId}`);
  }

  // Método para obter os dados de um usuário por ID
  getUserById(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`);
  }

  // Método para criar um novo usuário
  createUser(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }

  // Método para atualizar um usuário
  updateUser(userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}`, userData);
  }
}
