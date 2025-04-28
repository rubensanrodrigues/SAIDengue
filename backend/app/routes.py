from flask import request
from app import app
from app.controller import AuthController, UserController
from app.controller import KnowledgeController, PacienteController
from app.controller import ExameController, StatsController

from app.openaiengine import OpenaiEngine


@app.route('/')
@app.route('/home')
def index():
    OpenaiEngine.create_ebbedings()

    return 'Index'


@app.route('/answer', methods=['POST'])
def answer():
    data = request.get_json()

    return OpenaiEngine.answer(data['question'])


@app.route('/ebbedings/create')
def create_ebbedings():
    OpenaiEngine.create_ebbedings()

    return 'Done Create Ebbedings'


# Auth
@app.route('/login', methods=['POST'])
def login():
    return AuthController.login(request)


# User
@app.route("/users", methods=["GET"])
def list_users():
    return UserController.list_users(request)


@app.route('/users', methods=['POST'])
def add_user():
    return UserController.add_user(request)


@app.route('/users', methods=['PUT'])
def update_user():
    return UserController.update_user(request)


@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    return UserController.get_user(request, user_id)


@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    return UserController.delete_user(request, user_id)


# Knowledge
@app.route("/knowledges", methods=["GET"])
def list_knowledges():
    return KnowledgeController.list_knowledges(request)


@app.route('/knowledges', methods=['POST'])
def add_knowledge():
    return KnowledgeController.add_knowledge(request)


@app.route('/knowledges', methods=['PUT'])
def update_knowledge():
    return KnowledgeController.update_knowledge(request)


@app.route('/knowledges/<int:knowledge_id>', methods=['GET'])
def get_knowledge(knowledge_id):
    return KnowledgeController.get_knowledge(request, knowledge_id)


@app.route("/knowledges/<int:knowledge_id>", methods=["DELETE"])
def delete_knowledge(knowledge_id):
    return KnowledgeController.delete_knowledge(request, knowledge_id)


# Paciente
@app.route("/pacientes", methods=["GET"])
def list_pacientes():
    return PacienteController.list_pacientes(request)


@app.route("/pacientes", methods=["POST"])
def add_paciente():
    return PacienteController.add_paciente(request)


@app.route("/pacientes/<int:paciente_id>", methods=["PUT"])
def update_paciente(paciente_id):
    return PacienteController.update_paciente(request, paciente_id)


@app.route("/pacientes/<int:paciente_id>", methods=["GET"])
def get_paciente(paciente_id):
    return PacienteController.get_paciente(request, paciente_id)


@app.route("/pacientes/<int:paciente_id>", methods=["DELETE"])
def delete_paciente(paciente_id):
    return PacienteController.delete_paciente(request, paciente_id)


# Exame
@app.route("/exames", methods=["POST"])
def add_exame():
    return ExameController.add_exame(request)


@app.route("/exames/<int:exame_id>", methods=["GET"])
def get_exame(exame_id):
    return ExameController.get_exame(request, exame_id)


@app.route("/exames/<int:exame_id>", methods=["PUT"])
def update_exame(exame_id):
    return ExameController.update_exame(request, exame_id)


@app.route("/exames/<int:exame_id>", methods=["DELETE"])
def delete_exame(exame_id):
    return ExameController.delete_exame(request, exame_id)


# Estatisticas
@app.route("/stats/evolucao", methods=["POST"])
def get_stats_evolucao():
    return StatsController.gerar_evolucao(request)
