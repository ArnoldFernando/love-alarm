#!/bin/bash

echo "=== Starting Love Alarm Development Environment ==="

# Start Docker services
cd docker
docker-compose up -d

# Start queue worker in background
docker-compose exec -d app php artisan queue:work --sleep=3 --tries=3

# Start Reverb in background
docker-compose exec -d app php artisan reverb:start

echo ""
echo "Services started:"
echo "  - API: http://localhost:8000"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo "  - Reverb: localhost:8080"
echo ""
echo "Start web:  cd app/web && npm run dev"
echo "Start mobile: cd apps/mobile && npx expo start"
