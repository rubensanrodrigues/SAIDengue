import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { KnowledgeService } from '../../../services/knowledge.service';
import { AppUserMenu } from "../appusermenu/appusermenu.component";
import { HeaderComponent } from '../../header/header.component'; 

@Component({
  selector: 'app-knowledge-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AppUserMenu, HeaderComponent],
  template: `
    <app-header title="SAI Dengue - Área protegida" [showLogout]="true">
      <app-usermenu header-menu/>
    </app-header>
    <div class="knowledge-form">
      <h1>{{ isEditMode ? 'Editar Conhecimento' : 'Novo Conhecimento' }}</h1>

      <form [formGroup]="knowledgeForm" (ngSubmit)="onSubmit()">
        <label for="subject">Título:</label>
        <input id="subject" formControlName="subject" />

        <label for="information">Descrição:</label>
        <textarea id="information" formControlName="information" rows="4"></textarea>

        <button type="submit" [disabled]="knowledgeForm.invalid">
          {{ isEditMode ? 'Atualizar' : 'Cadastrar' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .knowledge-form {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    label {
      display: block;
      margin-top: 15px;
    }
    input, textarea {
      width: 100%;
      padding: 8px;
      margin-top: 5px;
    }
    button {
      margin-top: 20px;
      padding: 10px 20px;
    }
  `]
})
export class KnowledgeFormComponent implements OnInit {
  knowledgeForm!: FormGroup;
  isEditMode = false;
  knowledgeId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private knowledgeService: KnowledgeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.knowledgeForm = this.fb.group({
      subject: ['', Validators.required],
      information: ['', Validators.required]
    });

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.knowledgeId = +paramId;
      this.isEditMode = true;
      this.loadKnowledge(this.knowledgeId);
    }
  }

  loadKnowledge(id: number): void {
    this.knowledgeService.getKnowledgeById(id).subscribe(response => {
      const knowledge = response.data;
      this.knowledgeForm.patchValue({
        subject: knowledge.subject,
        information: knowledge.information
      });
    });
  }

  onSubmit(): void {
    if (this.knowledgeForm.invalid) return;

    const knowledgeData = this.knowledgeForm.getRawValue();
    if (this.isEditMode && this.knowledgeId) {
      knowledgeData.id = this.knowledgeId;
      this.knowledgeService.updateKnowledge(knowledgeData).subscribe(() => {
        alert('Conhecimento atualizado com sucesso!');
        this.router.navigate(['/protected/appuser/knowledges']);
      });
    } else {
      this.knowledgeService.createKnowledge(knowledgeData).subscribe(() => {
        alert('Conhecimento criado com sucesso!');
        this.router.navigate(['/protected/appuser/knowledges']);
      });
    }
  }
}
