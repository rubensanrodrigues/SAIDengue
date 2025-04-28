import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AppUserMenu } from "../appusermenu/appusermenu.component";
import { HeaderComponent } from '../../header/header.component'; 

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AppUserMenu, HeaderComponent],
  template: `
    <app-header title="SAI Dengue - Área protegida" [showLogout]="true">
      <app-usermenu header-menu/>
    </app-header>
    <div class="user-form">
      <h1>{{ isEditMode ? 'Editar Usuário' : 'Novo Usuário' }}</h1>

      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <label for="username">Username:</label>
        <input id="username" formControlName="username" />

        <label for="useremail">E-Mail:</label>
        <input id="useremail" formControlName="useremail" />

        <label for="password">Senha:</label>
        <input id="password" type="password" formControlName="password" />

        <button type="submit" [disabled]="userForm.invalid">
          {{ isEditMode ? 'Atualizar' : 'Cadastrar' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .user-form {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    label {
      display: block;
      margin-top: 15px;
    }
    input {
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
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  userId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      useremail: ['', Validators.required],
      password: ['']  // só usado na criação
    });

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.userId = +paramId;
      this.isEditMode = true;
      this.loadUser(this.userId);
    }
  }

  loadUser(id: number): void {
    this.userService.getUserById(id).subscribe(response => {
      const user = response.data;
      this.userForm.patchValue({
        username: user.username,
        useremail: user.useremail
      });
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    const userData = this.userForm.getRawValue(); // inclui campos desabilitados
    if (this.isEditMode && this.userId) {
      userData.id = this.userId;
      this.userService.updateUser(userData).subscribe(() => {
        alert('Usuário atualizado com sucesso!');
        this.router.navigate(['/protected/appuser/users']);
      });
    } else {
      this.userService.createUser(userData).subscribe(() => {
        alert('Usuário criado com sucesso!');
        this.router.navigate(['/protected/appuser/users']);
      });
    }
  }
}
