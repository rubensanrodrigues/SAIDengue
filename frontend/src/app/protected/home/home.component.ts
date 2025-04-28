// home.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { EvolucaoPizzaComponent } from "../graph/evolucao-pizza/evolucao-pizza.component"; 

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterModule, HeaderComponent, EvolucaoPizzaComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {}
