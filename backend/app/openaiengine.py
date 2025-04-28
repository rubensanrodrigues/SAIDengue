import ast
import numpy as np  # type: ignore
import pandas as pd  # type: ignore

import openai  # type: ignore
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
            print(f'DEBUG iteracao {i}')

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

                print("DEBUG Fazendo embedding do texto")
            except openai.error.RateLimitError:
                print("DEBUG Rate limit error, esperando 20 segundo antes de tentar novamente")  # noqa: E501
                sleep(20)
                embedding_result = openai.Embedding.create(
                    input=knowledge_formated.resized,
                    engine='text-embedding-ada-002'
                )

                embedding = embedding_result['data'][0]['embedding']
                if embedding:
                    knowledge_formated.is_created = True
                    knowledge_formated.embeddings = str(embedding)
                print("DEBUG embedding texto depois de esperar 20 segundos")

            i += 1
            Session.add(knowledge_formated)

        if is_dbcommit:
            Session.commit()

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

    return "\n\n###\n\n".join(returns)


def get_answer(
        question,
        model="gpt-3.5-turbo-instruct",
        max_size=1800,
        max_tokens=150,
        stop_sequence=None):
    try:
        context = get_context(question, max_size=max_size)
        if not context.strip():
            return "Não foi possível encontrar informações suficientes para responder à pergunta."

        prompt = (
            "Responda à pergunta com base no contexto abaixo. "
            "Se a pergunta não puder ser respondida com as informações fornecidas, diga: "
            "\"Eu não sei responder isso.\"\n\n"
            f"Contexto:\n{context}\n\n---\n\nPergunta: {question}\n\nResposta:"
        )

        print(prompt)
        response = openai.Completion.create(
            prompt=prompt,
            temperature=0,
            max_tokens=max_tokens,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
            stop=stop_sequence,
            model=model
        )

        return response["choices"][0]["text"].strip()
    except Exception as e:
        print(e)
        return "Erro ao processar sua pergunta. Tente novamente em instantes."
