import { Component, OnInit } from '@angular/core';
import { KnowledgeService } from '../../../services/knowledge.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppUserMenu } from "../appusermenu/appusermenu.component";
import { HeaderComponent } from '../../header/header.component'; 

@Component({
  selector: 'app-knowledge-list',
  standalone: true,
  imports: [CommonModule, RouterModule, AppUserMenu, HeaderComponent],
  template: `
    <app-header title="SAI Dengue - Área protegida" [showLogout]="true">
      <app-usermenu header-menu/>
    </app-header>
    <div class="knowledge-list">
      <h1>Lista de Conhecimentos</h1>
      <div style="text-align: right; margin-top: 20px;">
        <button (click)="novo()" class="btn-editar">+ Novo</button>
      </div>
      <div class="knowledge-table">
        <table>
          <thead>
            <tr>
              <th>Assunto</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let knowledge of knowledges">
              <td>{{ knowledge.subject }}</td>
              <td>
                <ng-container *ngIf="![1].includes(knowledge.id); else noActions">
                  <button (click)="editKnowledge(knowledge.id)">Editar</button>
                  <button (click)="deleteKnowledge(knowledge.id)">Excluir</button>
                </ng-container>
                <ng-template #noActions>
                  <span>&gt;&gt; Sem ações disponíveis &lt;&lt;</span>
                </ng-template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .knowledge-list {
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
    }
    .knowledge-table table {
      width: 100%;
      border-collapse: collapse;
    }
    .knowledge-table th, .knowledge-table td {
      padding: 10px;
      border: 1px solid #ddd;
    }
    .knowledge-table th {
      background-color: #f4f4f4;
    }
    button {
      padding: 5px 10px;
      margin: 5px;
      border: none;
      background-color: #007bff;
      color: white;
      cursor: pointer;
      border-radius: 4px;
    }
    button:hover {
      background-color: #0056b3;
    }
  `]
})
export class KnowledgesListComponent implements OnInit {
  knowledges: any[] = [];

  constructor(
    private knowledgeService: KnowledgeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadKnowledges();
  }

  loadKnowledges(): void {
    this.knowledgeService.getKnowledges().subscribe((response: any) => {
      this.knowledges = response.map((k: any) => ({ ...k, id: Number(k.id) }));
    });
  }

  editKnowledge(knowledgeId: number): void {
    this.router.navigate([`/protected/appuser/knowledges/editar/${knowledgeId}`]);
  }

  novo(): void {
    this.router.navigate([`/protected/appuser/knowledges/novo`]);
    
  }

  deleteKnowledge(knowledgeId: number): void {
    if (confirm('Tem certeza que deseja excluir este conhecimento?')) {
      this.knowledgeService.deleteKnowledge(knowledgeId).subscribe(() => {
        alert('Conhecimento excluído com sucesso!');
        this.loadKnowledges();  // Recarrega a lista após exclusão
      });
    }
  }
}
