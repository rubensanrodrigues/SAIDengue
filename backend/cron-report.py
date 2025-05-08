#!/usr/bin/python3
from app import Session
from app.reports import StatsReport
from app.models import Knowledge

from tiktoken import get_encoding

# estudar > Chunking inteligente para otimizar embbedings

print("Iniciando tarefa de criação de relatório de Análise Epidemiológica")
try:
    report = StatsReport.compilar_boletim_contextual(meses=3)

    kid = 1
    knowledge = Session.get(Knowledge, kid)
    if not knowledge:
        print(f"Não foi possível recuperar o conhecimento de id {kid}")
    else:
        # cl100k_base que foi projetado para funcionar com o ada-002
        tokenizer = get_encoding("cl100k_base")
        token_count = len(tokenizer.encode(report))

        knowledge.subject = 'Análise Epidemiológica por Bairro e Período'
        knowledge.information = report
        knowledge.token_count = token_count

        sanitized = knowledge.information.replace('\r', '')  # .replace('\n', ' ')

        knowledge_formated = knowledge.formateds[0]
        knowledge_formated.token_count = len(tokenizer.encode(sanitized))
        knowledge_formated.resized = sanitized
        knowledge_formated.embeddings = ''
        knowledge_formated.is_created = False

        Session.add(knowledge)
        Session.add(knowledge_formated)
        Session.commit()

    print("Finalizado tarefa de criação de relatório de Análise Epidemiológica")
except Exception as e:
    print(f"Erro durante a execução da tarefa de criação de relatório de Análise Epidemiológica: {e}")
