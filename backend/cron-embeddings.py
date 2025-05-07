#!/usr/bin/python3
from app.openaiengine import OpenaiEngine

print("Iniciando tarefa de criação de embeddings")
try:
    OpenaiEngine.create_ebbedings()
    print("Finalizado tarefa de criação de embeddings")
except Exception as e:
    print(f"Erro durante a execução da tarefa de criação de embeddings: {e}")
