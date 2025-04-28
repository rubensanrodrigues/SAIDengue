import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { sessionLogoutUser } from '../lib/session/session.util'; 

@Component({
  selector: 'app-logout',
  standalone: true,
  template: '', // sem template, apenas redireciona
})
export class LogoutComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    sessionLogoutUser(); // limpa os dados do session
    this.router.navigate(['/protected/login']); // redireciona para rota desejada
  }
}
