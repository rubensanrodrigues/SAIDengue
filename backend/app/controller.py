from app import Session
from app.models import KUser, Knowledge, KnowledgeFormated, Paciente, Exame
from app.helper import Helper, AuthToken, ResponseWrapper, split_in_shorters

from sqlalchemy import func, desc
from datetime import datetime, date, timedelta

from tiktoken import get_encoding


# Controla autenticacao
class AuthController():

    def login(request):
        response_wrapper = ResponseWrapper()
        data = request.get_json()

        user = Session.query(KUser).filter_by(
            username=data['username'],
            password=data['password']).first()
        if user:
            payload = Helper.get_payload(user.id)
            token = Helper.generate_jwt(payload)
            return response_wrapper.get_response(data={"token": token})

        return response_wrapper.get_response(
            status=401,
            message="Usuário ou senha invalido"
        )


# Controla usuarios
class UserController():

    def list_users(request):
        response_wrapper = ResponseWrapper()
        auth_token = AuthToken(request)
        if auth_token.is_error():
            return auth_token.get_return()

        users = Session.query(KUser).all()
        if not users:
            return response_wrapper.get_response(status=404, message="Não há usuários cadastrados")

        result = [{"id": str(user.id), "username": user.username} for user in users]
        return response_wrapper.get_response(data=result)

    def add_user(request):
        response_wrapper = ResponseWrapper()
        data = request.get_json()

        user = KUser(username=data['username'], useremail=data['useremail'], password=data['password'])
        Session.add(user)
        Session.commit()

        return response_wrapper.get_response(status=201, message="Usuário criado com sucesso")

    def update_user(request):
        response_wrapper = ResponseWrapper()
        auth_token = AuthToken(request)
        if auth_token.is_error():
            return auth_token.get_return()

        data = request.get_json()
        if data['id']:
            user = Session.query(KUser).get(int(data['id']))
            if not user:
                return response_wrapper.get_response(status=404, message="Usuário não encontrado")

            user.username = data['username']
            user.useremail = data['useremail']
            user.password = data['password']

            Session.add(user)
            Session.commit()

            return response_wrapper.get_response(status=200, message="Usuário atualizado com sucesso")

    def get_user(request, user_id):
        response_wrapper = ResponseWrapper()
        auth_token = AuthToken(request)
        if auth_token.is_error():
            return auth_token.get_return()

        user = Session.query(KUser).get(user_id)
        if not user:
            return response_wrapper.get_response(status=404, message="Usuário não encontrado")

        return response_wrapper.get_response(
            data={
                'id': user.id,
                'username': user.username,
                'useremail': user.useremail,
                'password': user.password
            }
        )

    def delete_user(request, user_id):
        response_wrapper = ResponseWrapper()
        auth_token = AuthToken(request)
        if auth_token.is_error():
            return auth_token.get_return()

        user = Session.query(KUser).get(user_id)
        if not user:
            return response_wrapper.get_response(status=404, message="Usuário não encontrado")

        Session.delete(user)
        Session.commit()

        return response_wrapper.get_response(message="Usuário deletado com sucesso")


# Controla Knowledge
class KnowledgeController():

    # ALL
    def list_knowledges(request):
        response_wrapper = ResponseWrapper()
        auth_token = AuthToken(request)
        if auth_token.is_error():
            return auth_token.get_return()

        knowledges = Session.query(Knowledge).all()
        if not knowledges:
            return response_wrapper.get_response(status=404, message="Não há conhecimentos cadastrados")

        result = [{"id": str(knowledge.id), "subject": knowledge.subject} for knowledge in knowledges]

        return response_wrapper.get_response(data=result)

    # CREATE
    def add_knowledge(request):
        response_wrapper = ResponseWrapper()
        auth_token = AuthToken(request)
        if auth_token.is_error():
            return auth_token.get_return()

        auth_uid = auth_token.get_subject()
        user = Session.query(KUser).get(auth_uid)
        if not user:
            return response_wrapper.get_response(status=401, message="Requer um usuário autenticado")

        data = request.get_json()

        # cl100k_base que foi projetado para funcionar com o ada-002
        tokenizer = get_encoding("cl100k_base")
        tokens = tokenizer.encode(data['information'])
        token_count = len(tokens)

        knowledge = Knowledge(
            subject=data['subject'],
            information=data['information'],
            token_count=token_count,
            kuser_id=user.id
        )
        Session.add(knowledge)
        Session.commit()

        max_tokens = 500
        splited_list = []
        sanitized = knowledge.information.replace('\r', '').replace('\n', ' ')
        if token_count > max_tokens:
            splited_list = split_in_shorters(tokenizer, sanitized, max_tokens)
        else:
            splited_list.append(sanitized)

        for text_block in splited_list:
            knowledge_formated = KnowledgeFormated()
            knowledge_formated.token_count = len(tokenizer.encode(text_block))
            knowledge_formated.resized = text_block
            knowledge_formated.knowledge_id = knowledge.id

            Session.add(knowledge_formated)

        Session.commit()
        return response_wrapper.get_response(status=201, message="Conhecimento criado com sucesso")

    # UPDATE
    def update_knowledge(request):
        response_wrapper = ResponseWrapper()
        auth_token = AuthToken(request)
        if auth_token.is_error():
            return auth_token.get_return()

        data = request.get_json()
        if data['id']:
            knowledge = Session.query(Knowledge).get(int(data['id']))
            if not knowledge:
                return response_wrapper.get_response(status=404, message="Conhecimento não encontrado")

            # cl100k_base que foi projetado para funcionar com o ada-002
            tokenizer = get_encoding("cl100k_base")
            tokens = tokenizer.encode(data['information'])
            token_count = len(tokens)

            knowledge.subject = data['subject']
            knowledge.information = data['information']
            knowledge.token_count = token_count

            Session.add(knowledge)
            Session.commit()

            for formated in knowledge.formateds:
                Session.delete(formated)

            Session.commit()

            max_tokens = 500
            splited_list = []
            sanitized = knowledge.information.replace('\r', '').replace('\n', ' ')
            if token_count > max_tokens:
                splited_list = split_in_shorters(tokenizer, sanitized, max_tokens)
            else:
                splited_list.append(sanitized)

            for text_block in splited_list:
                knowledge_formated = KnowledgeFormated()
                knowledge_formated.token_count = len(tokenizer.encode(text_block))
                knowledge_formated.resized = text_block
                knowledge_formated.knowledge_id = knowledge.id

                Session.add(knowledge_formated)

            Session.commit()

            return response_wrapper.get_response(message="Conhecimento atualizado com sucesso")

    # GET
    def get_knowledge(request, knowledge_id):
        response_wrapper = ResponseWrapper()
        auth_token = AuthToken(request)
        if auth_token.is_error():
            return auth_token.get_return()

        knowledge = Session.query(Knowledge).get(knowledge_id)
        if not knowledge:
            return response_wrapper.get_response(status=404, message="Conhecimento não encontrado")

        return response_wrapper.get_response(
            data={
                'id': str(knowledge.id),
                'subject': knowledge.subject,
                'information': knowledge.information
            }
        )

    # DELETE
    def delete_knowledge(request, knowledge_id):
        response_wrapper = ResponseWrapper()
        auth_token = AuthToken(request)
        if auth_token.is_error():
            return auth_token.get_return()

        knowledge = Session.query(Knowledge).get(knowledge_id)
        if not knowledge:
            return response_wrapper.get_response(status=404, message="Conhecimento não encontrado")

        for formated in knowledge.formateds:
            Session.delete(formated)

        Session.delete(knowledge)
        Session.commit()

        return response_wrapper.get_response(message="Conhecimento deletado com sucesso")


class PacienteController():

    # List
    def list_pacientes(request):
        response_wrapper = ResponseWrapper()

        nome_filtro = request.args.get('nome')
        query = Session.query(Paciente)

        if nome_filtro:
            query = query.filter(Paciente.nome.ilike(f'%{nome_filtro}%'))

        pacientes = query.order_by(Paciente.nome.asc()).all()

        if not pacientes:
            return response_wrapper.get_response(status=404, message="Nenhum paciente encontrado")

        result = [
            {
                "id": p.id,
                "nome": p.nome,
                "data_nascimento": p.data_nascimento.strftime('%Y-%m-%d'),
                "genero": p.genero,
                "contato": p.contato
            } for p in pacientes
        ]
        return response_wrapper.get_response(data=result)

    # CREATE
    def add_paciente(request):
        response_wrapper = ResponseWrapper()
        data = request.get_json()

        paciente = Paciente(
            nome=data['nome'],
            data_nascimento=datetime.strptime(data['data_nascimento'], '%Y-%m-%d').date(),
            genero=data['genero'],
            contato=data['contato'],
            historico_saude=data.get('historico_saude', ''),
            endereco_cep=data['endereco_cep'],
            endereco_logradouro=data['endereco_logradouro'],
            endereco_numero=data['endereco_numero'],
            endereco_complemento=data.get('endereco_complemento', ''),
            endereco_bairro=data['endereco_bairro'],
            endereco_cidade=data['endereco_cidade']
        )
        Session.add(paciente)
        Session.commit()

        return response_wrapper.get_response(status=201, message="Paciente criado com sucesso")

    # UPDATE
    def update_paciente(request, paciente_id):
        response_wrapper = ResponseWrapper()
        data = request.get_json()

        paciente = Session.query(Paciente).get(paciente_id)
        if not paciente:
            return response_wrapper.get_response(status=404, message="Paciente não encontrado")

        paciente.nome = data['nome']
        paciente.data_nascimento = datetime.strptime(data['data_nascimento'], '%Y-%m-%d').date()
        paciente.genero = data['genero']
        paciente.contato = data['contato']
        paciente.historico_saude = data.get('historico_saude', '')
        paciente.endereco_cep = data['endereco_cep']
        paciente.endereco_logradouro = data['endereco_logradouro']
        paciente.endereco_numero = data['endereco_numero']
        paciente.endereco_complemento = data.get('endereco_complemento', '')
        paciente.endereco_bairro = data['endereco_bairro']
        paciente.endereco_cidade = data['endereco_cidade']

        Session.commit()

        return response_wrapper.get_response(message="Paciente atualizado com sucesso")

    # GET
    def get_paciente(request, paciente_id):
        response_wrapper = ResponseWrapper()

        paciente = Session.query(Paciente).get(paciente_id)
        if not paciente:
            return response_wrapper.get_response(status=404, message="Paciente não encontrado")

        exames = sorted(paciente.exames, key=lambda e: e.exame_data, reverse=True)

        exames_data = []
        for exame in exames:
            exames_data.append({
                "id": exame.id,
                "exame_data": exame.exame_data.strftime('%Y-%m-%d'),
                "exame_tipo": exame.exame_tipo,
                "exame_status": exame.exame_status,
                "resultado_data": exame.resultado_data.strftime('%Y-%m-%d') if exame.resultado_data else None,
                "resultado_observacoes": exame.resultado_observacoes,
                "resultado_status": exame.resultado_status
            })

        return response_wrapper.get_response(data={
            "id": paciente.id,
            "nome": paciente.nome,
            "data_nascimento": paciente.data_nascimento.strftime('%Y-%m-%d'),
            "genero": paciente.genero,
            "contato": paciente.contato,
            "historico_saude": paciente.historico_saude,
            "endereco_cep": paciente.endereco_cep,
            "endereco_logradouro": paciente.endereco_logradouro,
            "endereco_numero": paciente.endereco_numero,
            "endereco_complemento": paciente.endereco_complemento,
            "endereco_bairro": paciente.endereco_bairro,
            "endereco_cidade": paciente.endereco_cidade,
            "exames": exames_data
        })

    # DELETE
    def delete_paciente(request, paciente_id):
        response_wrapper = ResponseWrapper()

        paciente = Session.query(Paciente).get(paciente_id)
        if not paciente:
            return response_wrapper.get_response(status=404, message="Paciente não encontrado")

        Session.delete(paciente)
        Session.commit()
        return response_wrapper.get_response(message="Paciente deletado com sucesso")


class ExameController():

    def add_exame(request):
        response_wrapper = ResponseWrapper()
        data = request.get_json()

        if data.get('resultado_data'):
            resultado_data = datetime.strptime(data['resultado_data'], '%Y-%m-%d').date()
        else:
            resultado_data = None

        exame = Exame(
            exame_data=datetime.strptime(data['exame_data'], '%Y-%m-%d').date(),
            exame_tipo=data['exame_tipo'],
            exame_status=data['exame_status'],
            resultado_data=resultado_data,
            resultado_observacoes=data.get('resultado_observacoes', ''),
            resultado_status=data['resultado_status'],
            paciente_id=data['paciente_id']
        )

        Session.add(exame)
        Session.commit()

        return response_wrapper.get_response(status=201, message="Exame cadastrado com sucesso")

    def get_exame(request, exame_id):
        response_wrapper = ResponseWrapper()
        exame = Session.query(Exame).get(exame_id)

        if not exame:
            return response_wrapper.get_response(status=404, message="Exame não encontrado")

        return response_wrapper.get_response(data={
            "id": exame.id,
            "exame_data": exame.exame_data.strftime('%Y-%m-%d'),
            "exame_tipo": exame.exame_tipo,
            "exame_status": exame.exame_status,
            "resultado_data": exame.resultado_data.strftime('%Y-%m-%d') if exame.resultado_data else None,
            "resultado_observacoes": exame.resultado_observacoes,
            "resultado_status": exame.resultado_status,
            "paciente_id": exame.paciente_id
        })

    def update_exame(request, exame_id):
        response_wrapper = ResponseWrapper()
        exame = Session.query(Exame).get(exame_id)

        if not exame:
            return response_wrapper.get_response(status=404, message="Exame não encontrado")

        data = request.get_json()

        # Exame
        exame.exame_data = datetime.strptime(data['exame_data'], '%Y-%m-%d').date()
        exame.exame_tipo = data['exame_tipo']
        exame.exame_status = data['exame_status']

        # Resltado
        if data.get('resultado_data'):
            exame.resultado_data = datetime.strptime(data['resultado_data'], '%Y-%m-%d').date()
        else:
            exame.resultado_data = None
        exame.resultado_observacoes = data.get('resultado_observacoes', '')
        exame.resultado_status = data['resultado_status']
        exame.paciente_id = data['paciente_id']

        Session.commit()

        return response_wrapper.get_response(message="Exame atualizado com sucesso")

    def delete_exame(request, exame_id):
        response_wrapper = ResponseWrapper()
        exame = Session.query(Exame).get(exame_id)

        if not exame:
            return response_wrapper.get_response(status=404, message="Exame não encontrado")

        Session.delete(exame)
        Session.commit()

        return response_wrapper.get_response(message="Exame removido com sucesso")


class StatsController:

    def gerar_evolucao(request):
        response_wrapper = ResponseWrapper()

        data = request.get_json()
        dias = int(data['dias'])
        dados = StatsController.resultado(dias=dias, limite_resultados=10)
        result = [{"cidade": row[0], "bairro": row[1], "total_casos": row[2]} for row in dados]

        return response_wrapper.get_response(data=result)

    @staticmethod
    def resultado(dias=30, limite_resultados=30):
        data_limite = date.today() - timedelta(days=dias)

        resultados = (
            Session.query(
                Paciente.endereco_cidade,
                Paciente.endereco_bairro,
                func.count(Exame.id).label('total_casos_positivos')
            )
            .join(Exame, Exame.paciente_id == Paciente.id)
            .filter(
                Exame.resultado_status == 'Positivo',
                Exame.resultado_data >= data_limite
            )
            .group_by(Paciente.endereco_cidade, Paciente.endereco_bairro)
            .order_by(desc('total_casos_positivos'))
            .limit(limite_resultados)
            .all()
        )
        return resultados
