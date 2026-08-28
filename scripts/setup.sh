#!/bin/bash
set -e

echo "=== Love Alarm Development Setup ==="

# Start Docker infrastructure
echo "Starting Docker services..."
cd docker
docker-compose up -d

# Wait for database
sleep 5

# Backend setup
echo "Setting up backend..."
cd ../backend
cp .env.example .env

# Generate Laravel key (requires composer install first)
if [ ! -d "vendor" ]; then
    echo "Installing PHP dependencies..."
    docker-compose -f ../docker/docker-compose.yml exec -T app composer install
fi

docker-compose -f ../docker/docker-compose.yml exec -T app php artisan key:generate
docker-compose -f ../docker/docker-compose.yml exec -T app php artisan migrate --seed

echo ""
echo "=== Setup Complete ==="
echo "API: http://localhost:8000"
echo "Web: cd app/web && npm install && npm run dev"
echo "Mobile: cd apps/mobile && npm install && npx expo start"
