#!/bin/sh
set -e

if [ -z "$OPENAI_API_KEY" ]; then
  echo "[entrypoint] ERROR: OPENAI_API_KEY is not set"
  exit 1
fi

envsubst '$OPENAI_API_KEY' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
