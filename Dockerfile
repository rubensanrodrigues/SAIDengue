FROM ubuntu:22.04

# export TZ=America/Sao_Paulo timezone
ENV TZ=America/Sao_Paulo

# Frontend
COPY frontend/dist/saidengue/browser /SAIDengue/frontend

# Backend
COPY backend/run.py /SAIDengue/backend/run.py
COPY backend/app    /SAIDengue/backend/app
COPY backend/requirements.txt /requirements.txt

# Cron
COPY backend/cron-embeddings.py /SAIDengue/backend/cron-embeddings.py
COPY crontab/SAIDengue-cron.txt /etc/cron.d/SAIDengue-cron

# Copiar configurações de inicialização e Nginx
COPY start.sh /start.sh
COPY nginx/SAIDengue.conf /SAIDengue.conf

# Instalar dependências e configurar o ambiente
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime                                                     \
    && echo $TZ > /etc/timezone                                                                        \
    && apt-get update                                                                                  \
    && apt-get -y install --no-install-recommends --no-install-suggests python3 python3-pip nginx cron \
    && python3 -m pip install -r /requirements.txt                                                     \
    && rm /etc/nginx/sites-enabled/default                                                             \
    && mv /SAIDengue.conf /etc/nginx/sites-available/SAIDengue.conf                                    \
    && ln -s /etc/nginx/sites-available/SAIDengue.conf /etc/nginx/sites-enabled/                       \
    && apt-get purge -y --auto-remove pip                                                              \
    && rm -rf /var/lib/apt/lists/*                                                                     \
    && rm -rf /etc/apt/sources.list.d/*.list                                                           \
    && rm -f /requirements.txt

# Garantir que o script de inicialização tenha permissões de execução
RUN chmod +x /start.sh

# Expor a porta 80
EXPOSE 80

# Definir o ponto de entrada
ENTRYPOINT ["/start.sh"]

# Definir o sinal de parada
STOPSIGNAL SIGINT