import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service'; 
import { Router } from '@angular/router';
import { AppUserMenu } from "../appusermenu/appusermenu.component";
import { HeaderComponent } from '../../header/header.component'; 

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, AppUserMenu, HeaderComponent],
  template: `
    <app-header title="SAI Dengue - Área protegida" [showLogout]="true">
      <app-usermenu header-menu/>
    </app-header>
    <div class="users-list">
      <h1>Lista de Usuários</h1>
      <div style="text-align: right; margin-top: 20px;">
        <button (click)="novo()" class="btn-editar">+ Novo</button>
      </div>
      <div class="user-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.username }}</td>
              <td>
                <button (click)="editUser(user.id)">Editar</button>
                <button (click)="deleteUser(user.id)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .users-list {
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
    }
    .user-table table {
      width: 100%;
      border-collapse: collapse;
    }
    .user-table th, .user-table td {
      padding: 10px;
      border: 1px solid #ddd;
    }
    .user-table th {
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
export class UsersListComponent implements OnInit {
  users: any[] = [];

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe((response: any) => {
      this.users = response.data;  // Ajuste conforme a resposta da API
      console.log(this.users);
      
    });
  }

  editUser(userId: number): void {
    this.router.navigate([`/protected/appuser/users/editar/${userId}`]);
  }

  novo(): void {
    this.router.navigate([`/protected/appuser/users/novo`]);
    
  }

  deleteUser(userId: number): void {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      this.userService.deleteUser(userId).subscribe(() => {
        alert('Usuário excluído com sucesso!');
        this.loadUsers();  // Recarrega a lista após exclusão
      });
    }
  }
}
