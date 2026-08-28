# Love Alarm - Deployment Guide

## Backend Deployment

### Requirements
- PHP 8.3+
- PostgreSQL 15+ with PostGIS extension
- Redis 7+
- Composer
- Supervisor (for queue workers)

### Server Setup

```bash
# Install PHP extensions
sudo apt-get install php8.3-fpm php8.3-pgsql php8.3-redis php8.3-mbstring php8.3-xml php8.3-bcmath php8.3-gd php8.3-zip

# Enable PostGIS
psql -d lovealarm -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Install dependencies
cd backend
composer install --no-dev --optimize-autoloader

# Environment
cp .env.example .env
php artisan key:generate

# Migrations
php artisan migrate --force
php artisan db:seed --force

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Queue Workers (Supervisor)

```ini
; /etc/supervisor/conf.d/lovealarm-worker.conf
[program:lovealarm-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/lovealarm/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/lovealarm-worker.log
```

### Laravel Reverb (WebSockets)

```ini
; /etc/supervisor/conf.d/lovealarm-reverb.conf
[program:lovealarm-reverb]
process_name=%(program_name)s
command=php /var/www/lovealarm/artisan reverb:start
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/lovealarm-reverb.log
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.lovealarm.app;
    root /var/www/lovealarm/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

## Web Deployment (Vercel)

```bash
cd app/web
vercel --prod
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`

## Mobile Deployment (Expo EAS)

```bash
cd apps/mobile
npx eas build --platform ios
npx eas build --platform android
```

## Environment Variables

See `.env.example` in backend and root for full configuration.

### Production Checklist
- [ ] Change default dev passwords
- [ ] Enable HTTPS
- [ ] Configure FCM credentials
- [ ] Configure S3/Cloudinary storage
- [ ] Set up log rotation
- [ ] Configure backups
- [ ] Enable rate limiting
- [ ] Review CORS settings
- [ ] Set `APP_DEBUG=false`
