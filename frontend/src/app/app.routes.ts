import { Routes } from '@angular/router';

import { PublicComponent } from './public/public.component';

import { PacienteComponent } from './protected/apppaciente/pacientes/paciente-form/paciente-form.component';
import { ExameComponent } from './protected/apppaciente/exames/exame.component';
import { PacienteListComponent } from './protected/apppaciente/pacientes/paciente-list/paciente-list.component';
import { PacienteDetalheComponent } from './protected/apppaciente/pacientes/paciente-detalhe/paciente-detalhe.component';

import { UsersListComponent } from './protected/appuser/users/users-list.component';
import { UserFormComponent } from './protected/appuser/users/user-form.component';
import { KnowledgesListComponent } from './protected/appuser/knowledges/knowledges-list.component';
import { KnowledgeFormComponent } from './protected/appuser/knowledges/knowledge-form.component';

import { authGuard } from './protected/lib/guards/auth.guard';
import { LoginComponent } from './protected/login/login.component';
import { LogoutComponent } from './protected/logout/logout.component';
import { HomeComponent } from './protected/home/home.component';


export const routes: Routes = [
  // Área pública
  { path: '', component: PublicComponent },

  // Área protegida (login e logout ainda fora do guard)
  { path: 'protected/login', component : LoginComponent },
  { path: 'protected/logout', component: LogoutComponent },


  // Protegido por authGuard
  {
    path: 'protected',
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },

      // Paciente
      { path: 'apppaciente', component: PacienteListComponent },
      { path: 'apppaciente/pacientes', component: PacienteListComponent },
      { path: 'apppaciente/pacientes/novo', component: PacienteComponent },
      { path: 'apppaciente/pacientes/:id', component: PacienteDetalheComponent },
      { path: 'apppaciente/pacientes/editar/:id', component: PacienteComponent },
      { path: 'apppaciente/pacientes/:pacienteId/exame/novo', component: ExameComponent },
      { path: 'apppaciente/pacientes/:pacienteId/exame/:exameId', component: ExameComponent },

      // Area administrativa
      { path: 'appuser', component: KnowledgesListComponent },
      { path: 'appuser/users', component: UsersListComponent },
      { path: 'appuser/users/novo', component: UserFormComponent },
      { path: 'appuser/users/editar/:id', component: UserFormComponent },
      { path: 'appuser/knowledges', component: KnowledgesListComponent },
      { path: 'appuser/knowledges/novo', component: KnowledgeFormComponent },
      { path: 'appuser/knowledges/editar/:id', component: KnowledgeFormComponent }
    ]
  },
];
