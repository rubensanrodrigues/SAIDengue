from datetime import datetime, timedelta, timezone

from flask import jsonify

from app import app
from jose import jwt, exceptions  # type: ignore


class Helper():
    def generate_jwt(payload):
        token = jwt.encode(
            payload,
            app.config['SECRET_KEY'],
            algorithm=app.config['ALGORITHM']
        )
        return token

    def verify_jwt(token):
        try:
            all = jwt.decode(
                token,
                app.config['SECRET_KEY'],
                algorithms=app.config['ALGORITHM']
            )
            return all['sub']
        except exceptions.JWTError:
            return None

    def get_payload(sub):
        return {
            'exp': datetime.now(timezone.utc) + timedelta(minutes=(2*60)),
            'iat': datetime.now(timezone.utc),
            'sub': f'{sub}'
        }


# auxiliar class AuthToken
class AuthToken():
    def __init__(self, request):
        self._token = request.headers.get('Authorization')
        self._err = False
        self._ret = None
        self._subject = ''

        response_wrapper = ResponseWrapper()

        # token esta vazio?
        if not self._token:
            self._ret = response_wrapper.get_response(
                status=422,
                message="Token está faltando"
            )
            self._err = True
        else:
            # subject valido?
            self._subject = Helper.verify_jwt(self._token)
            if not self._subject:
                self._ret = response_wrapper.get_response(
                    status=422,
                    message="Token invalido"
                )
                self._err = True

    def get_token(self):
        return self._token

    def get_return(self):
        return self._ret

    def is_error(self):
        return self._err

    def get_subject(self):
        return self._subject

    def __repr__(self):
        return f'AuthToken({self._token}, {self._subject}, {self._err}, {self._ret})'  # noqa: E501


class ResponseWrapper():
    def __init__(self, status=200):
        self._status = status

    def set_status(self, status):
        self._status = status

    def get_response(self, message=None, data=None, status=None):
        if status:
            self._status = status

        ret = {"status": str(self._status)}

        if message:
            ret.update({"message": message})
        else:
            message = self.get_default_message()
            ret.update({"message": message})

        if data:
            ret.update({"data": data})

        return (jsonify(ret), self._status)

    def get_default_message(self):
        status = str(self._status)

        # comuns da api
        messages = {
            "200": "OK",
            "201": "Created",
            "401": "Unauthorized Access",
            "404": "Not Found",
            "422": "Unprocessable Content"
        }

        return messages[status]


def split_in_shorters(tokenizer, text, max_tokens, sep='. '):
    text_block = ''
    text_blocks = []
    token_count_accu = 0

    sentences = text.split(sep)
    for sentence in sentences:

        # limpeza padrao
        sentence = sentence.replace('\r', '')
        sentence = sentence.replace('\n', ' ')
        sentence = sentence.strip()

        token_count = len(tokenizer.encode(sentence))
        if (token_count_accu + token_count) > max_tokens:
            text_blocks.append(f'{text_block}')

            # reconfigura variaveis
            text_block = sentence
            token_count_accu = token_count
        else:
            text_block = f'{text_block}{sentence}{sep} '
            token_count_accu += token_count

    if text_block:
        text_blocks.append(f'{text_block}')

    return text_blocks
