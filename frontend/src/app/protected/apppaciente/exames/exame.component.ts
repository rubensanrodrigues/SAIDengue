import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ExameService } from '../../../services/exame.service';
import { HeaderComponent } from '../../header/header.component';
import { AppPacienteMenu } from '../apppacientemenu/apppacientemenu.component'; 

@Component({
  selector: 'app-exame-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, AppPacienteMenu],
  templateUrl: './exame.component.html',
  styleUrls: ['./exame.component.css']
})
export class ExameComponent implements OnInit {
  exameForm!: FormGroup;
  pacienteId!: number;
  exameId!: number | null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private exameService: ExameService
  ) {}

  ngOnInit(): void {
    this.exameForm = this.fb.group({
      exame_data: ['', Validators.required],
      exame_tipo: ['', Validators.required],
      exame_status: ['', Validators.required],

      resultado_data: [''],
      resultado_status: [''],
      numero_notificacao: [''],
      resultado_observacoes: ['']
    });

    this.exameForm.get('exame_status')?.valueChanges.subscribe(status => {
      if (status === 'Concluído') {
        this.exameForm.get('resultado_data')?.setValidators(Validators.required);
        this.exameForm.get('resultado_status')?.setValidators(Validators.required);
      } else {
        this.exameForm.get('resultado_data')?.clearValidators();
        this.exameForm.get('resultado_status')?.clearValidators();
      }
  
      this.exameForm.get('resultado_data')?.updateValueAndValidity();
      this.exameForm.get('resultado_status')?.updateValueAndValidity();
    });

    this.route.paramMap.subscribe(params => {
      this.pacienteId = Number(params.get('pacienteId'));
      const exameIdParam = params.get('exameId');
      if (exameIdParam) {
        this.exameId = +exameIdParam;
        this.isEditMode = true;
        this.carregarExame(this.exameId);
      }
    });
  }

  carregarExame(id: number): void {
    this.exameService.buscarExamePorId(id).subscribe(response => {
      this.exameForm.patchValue(response.data);
    });
  }

  onSubmit(): void {
    if (this.exameForm.invalid) return;

    const dados = this.exameForm.value;
    dados.paciente_id = this.pacienteId;

    if (this.isEditMode && this.exameId) {
      this.exameService.atualizarExame(this.exameId, dados).subscribe(() => {
        alert('Exame atualizado com sucesso!');
        this.router.navigate(['/protected/apppaciente/pacientes', this.pacienteId]);
      });
    } else {
      this.exameService.criarExame(dados).subscribe(() => {
        alert('Exame criado com sucesso!');
        this.router.navigate(['/protected/apppaciente/pacientes', this.pacienteId]);
      });
    }
  }
}
