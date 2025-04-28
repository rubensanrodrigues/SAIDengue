import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo">
      <img src="/logo-grupo-pi.png" alt="Logotipo do projeto. Golfinho usando óculos e digitando em um teclado de computador" />
      <p>PROJETO INTEGRADOR III</p>
    </div>
  `
})
export class LogoComponent {}
