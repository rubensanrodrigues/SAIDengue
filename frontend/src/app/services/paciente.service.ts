import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = `${API_BASE_URL}/pacientes`;

  constructor(private http: HttpClient) {}

  cadastrarPaciente(dados: any): Observable<any> {
    console.log(dados);
    return this.http.post(this.apiUrl, dados);
  }

  atualizarPaciente(id: number, dados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dados);
  } 

  buscarPacientePorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  buscarPacientesPorNome(nome: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}?nome=${nome}`).pipe(
      map(response => response.data)
    );
  }

  buscarTodosPacientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }
}
