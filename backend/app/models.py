from app import db
from datetime import datetime


class KUser(db.Model):
    __tablename__ = 'kuser'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    useremail = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String)

    knowledges = db.relationship('Knowledge', backref='user', lazy=True)

    def __repr__(self) -> str:
        return f'KUser({self.id}, {self.username}, {self.useremail}, {self.password})'


class Knowledge(db.Model):
    id = db.Column(db.Integer, db.Sequence('knowledge_id_seq', start=10), primary_key=True)
    subject = db.Column(db.String, nullable=False)
    information = db.Column(db.Text, nullable=False)
    token_count = db.Column(db.Integer, nullable=False)

    kuser_id = db.Column(
        db.Integer,
        db.ForeignKey('kuser.id'),
        nullable=False
    )

    formateds = db.relationship('KnowledgeFormated', backref='knowledge', lazy=True)

    def __repr__(self) -> str:
        return f'Knowledge({self.id}, {self.subject}, {self.token_count})'


class KnowledgeFormated(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    token_count = db.Column(db.Integer, nullable=False)
    resized = db.Column(db.Text, nullable=False)
    embeddings = db.Column(db.Text, default='')
    is_created = db.Column(db.Boolean, unique=False, default=False)

    knowledge_id = db.Column(
        db.Integer,
        db.ForeignKey('knowledge.id'),
        nullable=False
    )

    def __repr__(self) -> str:
        return f'KnowledgeFormated({self.id}, {self.token_count}, {self.resized})'


class Paciente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    nome = db.Column(db.String(255), nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False)
    genero = db.Column(db.String(50), nullable=False)  # Ex: Masculino, Feminino, Outro
    esta_gravida = db.Column(db.Boolean, nullable=True)
    contato = db.Column(db.String(50), nullable=False)
    historico_saude = db.Column(db.String, nullable=True)

    endereco_cep = db.Column(db.String(255), nullable=False)
    endereco_logradouro = db.Column(db.String(255), nullable=False)
    endereco_numero = db.Column(db.String(255), nullable=False)
    endereco_complemento = db.Column(db.String(255), nullable=True)
    endereco_bairro = db.Column(db.String(255), nullable=False)
    endereco_cidade = db.Column(db.String(255), nullable=False)

    def __repr__(self) -> str:
        return f'Paciente({self.id}, {self.nome}, {self.data_nascimento})'


class Exame(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Exame
    exame_data = db.Column(db.Date, nullable=False)
    exame_tipo = db.Column(db.String(50), nullable=False)  # Ex: PCR, Teste Rápido, Sorologia
    exame_status = db.Column(db.String(50), nullable=False)  # Ex: Em andamento, Concluído, etc.

    # Resultado
    resultado_data = db.Column(db.Date, nullable=True)
    resultado_observacoes = db.Column(db.Text, nullable=True)
    resultado_status = db.Column(db.String(50), nullable=True)  # Ex: Positivo, Negativo, Inconclusivo
    numero_notificacao = db.Column(db.String(50), nullable=True)

    # Relacionamento com Paciente
    paciente_id = db.Column(
        db.Integer,
        db.ForeignKey('paciente.id'),
        nullable=False
    )
    paciente = db.relationship('Paciente', backref='exames', lazy=True)
