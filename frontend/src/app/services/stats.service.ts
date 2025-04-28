import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { EvolucaoItem } from '../models/evolucao-item.model'; // ajuste o path conforme necessário

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = `${API_BASE_URL}/stats`;

  constructor(private http: HttpClient) {}

  getEvolucaoData(dias: number): Observable<EvolucaoItem[]> {
    return this.http.post<{ data: EvolucaoItem[] }>(`${this.apiUrl}/evolucao`, { dias })
      .pipe(map(res => res.data));
  }
}
