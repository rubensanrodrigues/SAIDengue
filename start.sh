#!/bin/sh

# CRON
printenv | grep -Ev "^(no_proxy|LS_COLORS)=" >> /etc/environment
/etc/init.d/cron start

# NGINX
/etc/init.d/nginx start

# SAIDengue-backend
cd SAIDengue/backend
exec waitress-serve --host 127.0.0.1 app:app