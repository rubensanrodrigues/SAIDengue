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
        <label for="username">* Username (5 ou mais caracteres)</label>
        <input id="username" formControlName="username" />

        <label for="useremail">* Email (email válido, não pode ser vazio)</label>
        <input id="useremail" formControlName="useremail" />

        <label for="password">* Senha (deve conter de 5 até 20 caracteres)</label>
        <input id="password" type="password" formControlName="password" />

        <p id="mensagemValidacao">
          * Os campos devem ser preenchidos conforme orientação
        </p>

        <button type="submit">
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
      username: ['', [Validators.required, Validators.minLength(5)]],
      useremail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]]
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
    if (this.userForm.invalid) {
      const msgEl = document.getElementById('mensagemValidacao');
      if (msgEl) {
        msgEl.classList.add('error-msg');
      }
      return;
    }

    const userData = this.userForm.getRawValue();
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
