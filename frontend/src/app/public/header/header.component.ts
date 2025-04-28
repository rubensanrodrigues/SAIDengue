import { Component } from '@angular/core';
import { LogoComponent } from './logo/logo.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LogoComponent],
  template: `<header><app-logo></app-logo></header>`
})
export class HeaderComponent {}
