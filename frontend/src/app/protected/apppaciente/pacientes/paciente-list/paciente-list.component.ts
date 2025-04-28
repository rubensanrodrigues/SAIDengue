import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { HeaderComponent } from '../../../header/header.component'; 
import { PacienteService } from '../../../../services/paciente.service';
import { AppPacienteMenu } from '../../apppacientemenu/apppacientemenu.component'; 

@Component({
  selector: 'app-paciente-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent, AppPacienteMenu],
  templateUrl: './paciente-list.component.html',
  styleUrls: ['./paciente-list.component.css']
})
export class PacienteListComponent implements OnInit {
  busca = new FormControl('');
  pacientes: any[] = [];

  constructor(
    private router: Router,
    private pacienteService: PacienteService
  ) {}

  ngOnInit(): void {
    this.carregarTodosPacientes(); // carrega todos no início

    this.busca.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(valor => {
        if (valor && valor.length >= 4) {
          return this.pacienteService.buscarPacientesPorNome(valor);
        } else {
          return of([]); // limpa listagem
        }
      })
    ).subscribe(resultados => {
      this.pacientes = resultados.slice(0, 30);
    });
  }

  carregarTodosPacientes(): void {
    this.pacienteService.buscarPacientesPorNome('').subscribe(resultados => {
      this.pacientes = resultados.slice(0, 30);
    });
  }

  onBuscarManual(): void {
    const valor = this.busca.value;
    if (valor && valor.length >= 2) {
      this.pacienteService.buscarPacientesPorNome(valor).subscribe(resultados => {
        this.pacientes = resultados.slice(0, 30);
      });
    }
  }

  abrirDetalhe(id: number): void {
    this.router.navigate(['/protected/apppaciente/pacientes', id]);
  }

  novoPaciente(): void {
    this.router.navigate(['/protected/apppaciente/pacientes/novo']);
  }
}
