import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { StatsService } from '../../../services/stats.service';
import { EvolucaoItem } from '../../../models/evolucao-item.model';

import {
  ChartOptions,
  ChartType,
  ChartData,
} from 'chart.js';

@Component({
  selector: 'app-evolucao-pizza',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
<div style="max-width: 500px; margin: auto">
  <h3>Casos de dengue por Localização nos últimos {{ numDias }} dias</h3>
  
  <!-- Select Combo para filtrar o número de dias -->
  <div>
    <label for="daysFilter">Selecione o número de dias:</label>
    <select id="daysFilter" (change)="onDaysChange($event)">
      <option value="15">15 dias</option>
      <option value="30">30 dias</option>
      <option value="45">45 dias</option>
      <option value="60">60 dias</option>
      <option value="90" selected>90 dias</option>
    </select>
  </div>

  <!-- Gráfico -->
  <canvas #chart baseChart
    [data]="pieChartData"
    [type]="pieChartType"
    [options]="pieChartOptions">
  </canvas>
</div>

<!-- Tabela -->
<div style="max-width: 500px; margin: auto">
  <div class="table-data">
    <table>
      <thead>
        <tr>
          <th>Localização</th>
          <th>Casos</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let row of tableData">
          <td>{{ row[0] }}</td>
          <td>{{ row[1] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <br><br>
</div>

  `,
  styles: [`
    .table-data table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .table-data th, .table-data td {
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    .table-data th {
      background-color: #f4f4f4;
    }

    .table-data tr:hover {
      background-color: #f1f1f1;
    }
  `]
})
export class EvolucaoPizzaComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  numDias: number = 0;
  tableData: any[] = [];

  pieChartType: ChartType = 'pie';
  pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' }
    }
  };

  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],  // Cores das fatias
      }
    ]
  };

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.numDias = 90;
    this.loadData(this.numDias);  // Carregar os dados iniciais com 90 dias
  }

  // Função chamada quando o usuário muda a seleção do número de dias
  onDaysChange(event: any): void {
    this.numDias = Number(event.target.value);  // Converte o valor de string para número
    this.loadData(this.numDias);  // Recarrega os dados com o novo valor de dias
  }

  // Função que carrega os dados conforme o número de dias selecionado
  loadData(days: number): void {
    this.statsService.getEvolucaoData(days).subscribe((data: EvolucaoItem[]) => {
      // Atualizando a tabela com os dados recebidos
      this.tableData = data.map(item => [`${item.bairro} (${item.cidade})`, item.total_casos]);

      // Atualizando os dados do gráfico
      this.pieChartData.labels = data.map(item => `${item.bairro} (${item.cidade})`);
      this.pieChartData.datasets[0].data = data.map(item => item.total_casos);

      // Atualizando as cores (se necessário)
      this.pieChartData.datasets[0].backgroundColor = this.getStaticColors(data.length);

      // Atualizando o gráfico
      this.chart?.update();
    });
  }

  // Função para retornar cores fixas (paleta de cores frias)
  getStaticColors(num: number): string[] {
    const colors = [
        '#AA0000', // Vermelho
        '#D45500', // Laranja
        '#D4AA00', // Amarelo
        '#006400', // Verde escuro
        '#4682B4', // Azul
        '#800080', // Roxo
        '#2F4F4F', // Verde escuro acinzentado
        '#556B2F', // Verde musgo
        '#1E90FF', // Azul céu
        '#6A5ACD', // Azul arroxeado
      ];

    // Se o número de fatias for maior que 10, repete as cores da paleta
    return Array.from({ length: num }, (_, index) => colors[index % colors.length]);
  }

  // Função para gerar cores aleatórias
  getRandomColors(num: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < num; i++) {
      const randomColor = `hsl(${Math.random() * 360}, 100%, 50%)`; // Cor aleatória HSL
      colors.push(randomColor);
    }
    return colors;
  }
}
