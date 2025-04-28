import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';  // Importando RouterModule

@Component({
  selector: 'app-root',
  standalone: true,  // Define que o componente é standalone
  imports: [RouterModule],  // Importando RouterModule para o roteamento funcionar
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SAI Dengue';
}
