import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteService } from '../../../../services/paciente.service';
import { HeaderComponent } from '../../../header/header.component';
import { AppPacienteMenu } from '../../apppacientemenu/apppacientemenu.component'; 

@Component({
  selector: 'app-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, AppPacienteMenu],
  templateUrl: './paciente-form.component.html',
  styleUrls: ['./paciente-form.component.css']
})
export class PacienteComponent implements OnInit {
  pacienteForm!: FormGroup;
  id: number | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private service: PacienteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pacienteForm = this.fb.group({
      id: [null],
      nome: ['', Validators.required],
      data_nascimento: ['', Validators.required],
      genero: ['', Validators.required],
      endereco_cep: ['', Validators.required],
      endereco_logradouro: ['', Validators.required],
      endereco_numero: ['', Validators.required],
      endereco_complemento: [''],
      endereco_bairro: ['', Validators.required],
      endereco_cidade: ['', Validators.required],
      contato: ['', Validators.required],
      historico_saude: ['']
    });

    // verifica se é edição
    this.route.paramMap.subscribe(params => {
      const paramId = params.get('id');
      if (paramId) {
        this.id = +paramId;
        this.isEditMode = true;
        this.carregarDadosPaciente(this.id);
      }
    });

    this.pacienteForm.get('endereco_cep')?.valueChanges.subscribe(cep => {
      if (cep && cep.length === 8) {
        this.buscarEnderecoPorCep(cep);
      }
    });
  }

  carregarDadosPaciente(id: number): void {
    this.service.buscarPacientePorId(id).subscribe(response => {
      const dados = response.data;
      this.pacienteForm.patchValue(dados);
    });
  }

  buscarEnderecoPorCep(cep: string): void {
    this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`)
      .subscribe(dados => {
        if (dados && !dados.erro) {
          this.pacienteForm.patchValue({
            endereco_logradouro: dados.logradouro,
            endereco_bairro: dados.bairro,
            endereco_cidade: dados.localidade
          });
        } else {
          alert('CEP não encontrado.');
        }
      }, error => {
        alert('Erro ao consultar o CEP.');
      });
  }

  onSubmit(): void {
    if (this.pacienteForm.invalid) return;

    const dados = this.pacienteForm.value;
    
    if (this.isEditMode && this.id) {
      this.service.atualizarPaciente(this.id, dados).subscribe(() => {
        alert('Paciente atualizado com sucesso!');
        this.router.navigate(['/protected/apppaciente/pacientes', this.id]);
      });
    } else {
      this.service.cadastrarPaciente(dados).subscribe(() => {
        alert('Paciente cadastrado com sucesso!');
        this.router.navigate(['/protected/apppaciente/pacientes']);
      });
    }
  }
}
