import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { SearchComponent } from './search/search.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-public',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SearchComponent],
  template: `
<div class="public">
  <app-header />
  <app-search />
</div>
  `
})
export class PublicComponent {}
