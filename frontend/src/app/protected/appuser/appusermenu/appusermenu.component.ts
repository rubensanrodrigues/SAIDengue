import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-usermenu',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav>
      <a routerLink="/protected">Início</a>
      <a routerLink="/protected/appuser/knowledges">Cadastro Conhecimento</a>
      <a routerLink="/protected/appuser/users">Cadastrar Usuário</a>
    </nav>
  `,
  styleUrls: ['./appusermenu.component.css']
})
export class AppUserMenu {}

