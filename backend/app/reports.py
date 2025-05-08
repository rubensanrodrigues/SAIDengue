import io
import csv
import json

from app import Session
from app.models import Paciente, Exame

from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy import func, desc, extract


class StatsReport:

    @staticmethod
    def resultado_intervalado(meses=3):
        data_limite = date.today() - timedelta(days=(meses * 30))

        resultados = (
            Session.query(
                Paciente.endereco_cidade,
                Paciente.endereco_bairro,
                extract('year', Exame.resultado_data).label('ano'),
                extract('month', Exame.resultado_data).label('mes'),
                func.count(Exame.id).label('total_casos_positivos')
            )
            .join(Exame, Exame.paciente_id == Paciente.id)
            .filter(
                Exame.resultado_status == 'Positivo',
                Exame.resultado_data >= data_limite
            )
            .group_by(
                Paciente.endereco_cidade,
                Paciente.endereco_bairro,
                'ano',
                'mes'
            )
            .order_by(desc('ano'), 'mes', desc('total_casos_positivos'))
            .all()
        )

        return resultados

    @staticmethod
    def organizar_em_tabela(resultados, meses_anteriores=4):
        # Gera lista dos últimos `meses_anteriores` meses com (ano, mes)
        hoje = date.today()
        lista_meses = [
            (
                (hoje - relativedelta(months=i)).year,
                (hoje - relativedelta(months=i)).month
            )
            for i in reversed(range(meses_anteriores))
        ]

        # Mapeia número do mês para nome
        nome_meses = {
            1: 'Janeiro',
            2: 'Fevereiro',
            3: 'Março',
            4: 'Abril',
            5: 'Maio',
            6: 'Junho',
            7: 'Julho',
            8: 'Agosto',
            9: 'Setembro',
            10: 'Outubro',
            11: 'Novembro',
            12: 'Dezembro'
        }

        # Organiza os resultados por cidade-bairro
        tabela = {}
        for cidade, bairro, ano, mes, total_casos in resultados:
            chave = (cidade, bairro)
            tabela.setdefault(chave, {})[(ano, mes)] = total_casos

        # Preenche os meses que não apareceram com 0
        for dados in tabela.values():
            for ano_mes in lista_meses:
                dados.setdefault(ano_mes, 0)

        # Cabeçalho com nomes formatados
        cabecalho = ['Cidade-Bairro'] + [
            f'{nome_meses[mes]} {ano}' for (ano, mes) in lista_meses
        ]

        tabela_final = [cabecalho]

        # Preenche as linhas
        for (cidade, bairro), dados in tabela.items():
            linha = [f"{cidade} - {bairro}"] + [
                dados[(ano, mes)] for (ano, mes) in lista_meses
            ]
            tabela_final.append(linha)

        return tabela_final

    @staticmethod
    def resultado_to_json(meses=4):
        resultados = StatsReport.resultado_intervalado(meses)
        tabela = StatsReport.organizar_em_tabela(resultados, meses)
        return json.dumps(tabela, ensure_ascii=False)

    @staticmethod
    def resultado_to_csv(meses=3):
        resultados = StatsReport.resultado_intervalado(meses)
        tabela = StatsReport.organizar_em_tabela(resultados, meses)

        output = io.StringIO()
        csv_writer = csv.writer(output)
        csv_writer.writerows(tabela)
        output.seek(0)
        return output.getvalue()

    @staticmethod
    def gerar_boletim_contextual(meses=3):
        return f"""Evolução dos Casos de Dengue - Análise Epidemiológica por Bairro e Período

Este relatório apresenta a evolução dos casos positivos de dengue registrados recentemente, com foco na análise por
cidade e bairro. A análise considera os resultados de exames que indicaram infecção por dengue, organizados por mês
e por localidade, permitindo observar com clareza se os casos estão aumentando ou diminuindo ao longo do tempo.

O objetivo principal é oferecer uma visão clara e comparativa dos casos de dengue, destacando:
- A distribuição mensal de casos de dengue
- O total de casos positivos por bairro
- A variação no número de casos ao longo dos últimos {meses} meses
- A tendência de crescimento ou redução de ocorrências
- A conclusão de análise baseada em dados epidemiológicos recentes

Este acompanhamento da dengue por bairro e por período é fundamental para entender o avanço da doença e apoiar ações
de controle e prevenção. A seguir, está a tabela com os resultados mensais dos casos de dengue por cidade e bairro,
representando o total de exames positivos registrados por período.

Confira os dados consolidados no período analisado:
"""

    @staticmethod
    def compilar_boletim_contextual(meses=3):
        texto = StatsReport.gerar_boletim_contextual(meses)
        csv = StatsReport.resultado_to_csv(meses)

        return f"{texto}\n\n{csv}\n"
