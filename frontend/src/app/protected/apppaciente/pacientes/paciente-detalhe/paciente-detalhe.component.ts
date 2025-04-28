import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteService } from '../../../../services/paciente.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../header/header.component';
import { AppPacienteMenu } from '../../apppacientemenu/apppacientemenu.component'; 

@Component({
  selector: 'app-paciente-detalhe',
  standalone: true,
  imports: [CommonModule, HeaderComponent, AppPacienteMenu],
  templateUrl: './paciente-detalhe.component.html',
  styleUrls: ['./paciente-detalhe.component.css']
})
export class PacienteDetalheComponent implements OnInit {
  paciente: any;
  carregando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pacienteService: PacienteService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pacienteService.buscarPacientePorId(id).subscribe(response => {
      this.paciente = response.data;
  
      // Ordena os exames pela data mais recente
      if (this.paciente.exames) {
        this.paciente.exames.sort((a: any, b: any) => {
          return new Date(b.exame_data).getTime() - new Date(a.exame_data).getTime();
        });
      }
  
      this.carregando = false;
    });
  }

  listagemPaciente() {
    this.router.navigate(['/protected/apppaciente/pacientes']);
  }

  editarPaciente() {
    this.router.navigate(['/protected/apppaciente/pacientes/editar', this.paciente.id]);
  }

  novoExame(): void {
    this.router.navigate(['/protected/apppaciente/pacientes', this.paciente.id, 'exame', 'novo']);
  }

  editarExame(exameId: number): void {
    this.router.navigate(['/protected/apppaciente/pacientes', this.paciente.id, 'exame', exameId]);
  }  
}
