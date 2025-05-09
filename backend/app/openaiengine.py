import ast
import time
import numpy as np  # type: ignore
import pandas as pd  # type: ignore

import openai  # type: ignore

from openai.error import OpenAIError, Timeout
from openai.embeddings_utils import distances_from_embeddings  # type: ignore

from time import sleep
from datetime import datetime, timedelta, timezone


from app import app, Session
from app.models import KnowledgeFormated

openai.api_key = app.config['OPENAI_KEY']

# cache
df = None
exp = datetime.now(timezone.utc)


class OpenaiEngine():
    def create_ebbedings():
        i = 0
        is_dbcommit = False
        knowledge_formateds = Session.query(KnowledgeFormated).filter_by(is_created=False).all()  # noqa: E501
        for knowledge_formated in knowledge_formateds:
            # wait = randrange(1, 6)
            sleep(2)
            print(f'EXEC Embbedings iteracao {i}')

            is_dbcommit = True
            try:
                embedding_result = openai.Embedding.create(
                    input=knowledge_formated.resized,
                    engine='text-embedding-ada-002'
                )

                embedding = embedding_result['data'][0]['embedding']
                if embedding:
                    knowledge_formated.is_created = True
                    knowledge_formated.embeddings = str(embedding)

                print("EXEC Fazendo embedding do texto")
            except openai.error.RateLimitError:
                print("EXEC Rate limit error, esperando 20 segundo antes de tentar novamente")  # noqa: E501
                sleep(20)
                embedding_result = openai.Embedding.create(
                    input=knowledge_formated.resized,
                    engine='text-embedding-ada-002'
                )

                embedding = embedding_result['data'][0]['embedding']
                if embedding:
                    knowledge_formated.is_created = True
                    knowledge_formated.embeddings = str(embedding)
                print("EXEC Embedding texto depois de esperar 20 segundos")

            i += 1
            Session.add(knowledge_formated)

        if is_dbcommit:
            Session.commit()

        print(f'EXEC Embbedings {i} registros processados')

    def prepare_df():
        global df, exp

        # se cache nao estiver expirado, nao faz nada
        if exp > datetime.now(timezone.utc):
            return None

        # configura novo cache para 15 minutos a partir de agora
        exp = datetime.now(timezone.utc) + timedelta(minutes=(15))

        df = pd.DataFrame(columns=['token_count', 'text', 'embeddings'])
        knowledge_formateds = Session.query(KnowledgeFormated).filter_by(is_created=True).all()  # noqa: E501
        for knowledge_formated in knowledge_formateds:
            df.loc[len(df.index)] = [
                knowledge_formated.token_count,
                knowledge_formated.resized,
                knowledge_formated.embeddings
            ]

        df['embeddings'] = df['embeddings'].apply(ast.literal_eval).apply(np.array)  # noqa: E501

    def answer(question):
        OpenaiEngine.prepare_df()
        return get_answer(question)


# auxiliares
def get_context(question, max_size=1800):
    response = openai.Embedding.create(
        input=question,
        engine='text-embedding-ada-002'
    )

    embeddings = response['data'][0]['embedding']
    df['distances'] = distances_from_embeddings(
        embeddings,
        df['embeddings'].values,
        distance_metric='cosine'
    )

    count = 0
    adjust = 10
    returns = []
    for index, row in df.sort_values('distances', ascending=True).iterrows():
        count += row['token_count']
        if (count + adjust) > max_size:
            break

        returns.append(row["text"])

    return "\n\n---\n\n".join(returns)


def tokens_to_words_estimate(max_tokens):
    return round(max_tokens * 0.75)


def get_answer(
        question,
        model="gpt-4-turbo",
        max_size=1800,
        max_tokens=150,
        stop_sequence=None):
    try:
        context = get_context(question, max_size=max_size)
        if not context.strip():
            return "Essa pergunta está fora do escopo dos dados disponíveis no momento."

        word_limit = tokens_to_words_estimate(max_tokens)

        system_prompt = (
            "Responda de forma objetiva, usando apenas as informações mais relevantes do contexto "
            f"e limite sua resposta a no máximo {word_limit} palavras. "
            "Se a pergunta não puder ser respondida com as informações fornecidas, diga: "
            "\"Eu não sei responder isso.\""
        )

        user_prompt = (
            f"Contexto:\n{context}\n\n"
            "---\n\n"
            "Outras informações relevantes sobre a dengue podem ser:\n"
            "A dengue é transmitida pelo mosquito Aedes aegypti, que se reproduz em água parada. "
            "Os principais sintomas incluem febre alta, dor muscular e manchas vermelhas.\n"
            "Prevenção: Eliminar criadouros de mosquitos, usar repelentes e telas de proteção.\n\n"
            "---\n\n"
            "Exemplo de perguntas possíveis:\n"
            "1. Qual bairro tem o maior número de casos de dengue?\n"
            "2. O que é a dengue e como é transmitida?\n\n"
            f"---\n\nPergunta: {question}\n"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        print(messages)

        retries = 3  # Defina o número de tentativas
        for attempt in range(retries):
            try:
                response = openai.ChatCompletion.create(
                    model=model,
                    messages=messages,
                    temperature=0,
                    max_tokens=max_tokens,
                    stop=stop_sequence,
                    timeout=10
                )

                return response["choices"][0]["message"]["content"].strip()
            except (OpenAIError, Timeout) as e:
                print(f"Erro de conexão: {e}. Tentando novamente...")
                time.sleep(5)  # Espera 5 segundos antes de tentar novamente

        print("Falha na comunicação após várias tentativas.")
        return "Falha na comunicação após várias tentativas. Tente em alguns instantes"

    except Exception as e:
        print(e)
        return "Erro ao processar sua pergunta. Tente novamente em instantes."
