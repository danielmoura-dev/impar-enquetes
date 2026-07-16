#!/bin/bash
# Deploy do Impar Enquetes na VPS.
# Executado pelo GitHub Actions a cada merge na main.
set -e  # qualquer erro aborta o deploy (nao deixa o sistema pela metade)

APP_DIR=/var/www/impar-enquetes

echo "==> Backend: dependencias"
cd $APP_DIR/backend
php8.4 /usr/local/bin/composer install --no-dev --optimize-autoloader --no-interaction

echo "==> Backend: migrations"
php8.4 artisan migrate --force

echo "==> Backend: caches"
php8.4 artisan config:cache
php8.4 artisan route:cache
php8.4 artisan view:cache

echo "==> Frontend: build"
cd $APP_DIR/frontend
npm ci
npm run build

echo "==> Permissoes"
chown -R www-data:www-data $APP_DIR

echo "==> Reiniciando workers"
supervisorctl restart impar-queue:*
supervisorctl restart impar-reverb

echo "==> Deploy concluido com sucesso!"