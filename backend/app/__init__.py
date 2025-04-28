import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

app = Flask(__name__)

# Configurações
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['ALGORITHM'] = os.getenv('ALGORITHM')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['OPENAI_KEY'] = os.getenv('OPENAI_KEY')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # evita warning

CORS(app)

# Inicializa o SQLAlchemy com pool_pre_ping=True
engine = create_engine(
    app.config['SQLALCHEMY_DATABASE_URI'],
    pool_pre_ping=True  # <-- importante!
)

session_factory = sessionmaker(bind=engine)
Session = scoped_session(session_factory)

db = SQLAlchemy()
db.init_app(app)


# Remove sessão após cada request
@app.teardown_appcontext
def shutdown_session(exception=None):
    Session.remove()


from app import routes  # noqa: F401 E402
