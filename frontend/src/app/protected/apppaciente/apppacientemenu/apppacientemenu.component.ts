import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pacientemenu',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav>
      <a routerLink="/protected">Início</a>
    </nav>
  `,
  styleUrls: ['./apppacientemenu.component.css']
})
export class AppPacienteMenu {}

