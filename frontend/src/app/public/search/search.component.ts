import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnswerService } from '../../services/answer.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section>
      <h2>SAI Dengue</h2>
      <div class="input-wrapper">
        <input
          autofocus
          id="inputSearch"
          class="inputSearch"
          placeholder="Olá! Digite aqui sua dúvida e pressione enter."
          (keyup)="keyUp($event)"
        />
        <button (click)="handleClick()" title="Clique aqui para proceguir com a consulta de sua pergunta.">Ir!</button>
      </div>
      <p>{{ response }}</p>
    </section>
  `
})
export class SearchComponent {
  response = '';

  constructor(private answerService: AnswerService) {}

  keyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const question = (event.target as HTMLInputElement).value;
      this.sendQuestion(question);
    }
  }

  handleClick(): void {
    const element = document.getElementById('inputSearch') as HTMLInputElement;
    const question = element.value;
    this.sendQuestion(question);
  }

  private sendQuestion(question: string): void {
    this.response = '';
    this.answerService.answer(question).subscribe({
      next: (res) => this.response = res,
      error: (err) => console.error(err)
    });
  }
}
