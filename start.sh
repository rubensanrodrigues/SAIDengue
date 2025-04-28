#!/bin/sh
/etc/init.d/nginx start
cd SAIDengue/backend
waitress-serve --host 127.0.0.1 app:app