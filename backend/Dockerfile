FROM php:8.3-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    && docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    mbstring \
    bcmath \
    intl \
    zip \
    exif \
    pcntl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache rewrite and headers
RUN a2enmod rewrite headers

RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Preserve Authorization header for Laravel/Sanctum
RUN printf '%s\n' \
    'SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1' \
    > /etc/apache2/conf-available/authorization.conf \
    && a2enconf authorization
# Laravel public directory
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri \
    -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf

WORKDIR /var/www/html

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy Laravel application FIRST
COPY . .

# Create Laravel Apache rewrite rules
RUN printf '%s\n' \
    '<IfModule mod_rewrite.c>' \
    '    <IfModule mod_negotiation.c>' \
    '        Options -MultiViews -Indexes' \
    '    </IfModule>' \
    '    RewriteEngine On' \
    '    RewriteCond %{HTTP:Authorization} .' \
    '    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP_AUTHORIZATION}]' \
    '    RewriteCond %{REQUEST_FILENAME} !-d' \
    '    RewriteCond %{REQUEST_FILENAME} !-f' \
    '    RewriteRule ^ index.php [L]' \
    '</IfModule>' \
    > public/.htaccess

# Install production dependencies
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader

# Create required Laravel directories
RUN mkdir -p \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    storage/app/public \
    bootstrap/cache

# Fix Laravel public storage symlink
RUN rm -rf public/storage && php artisan storage:link

# Set permissions
RUN chown -R www-data:www-data \
    storage \
    bootstrap/cache

RUN chmod -R 775 \
    storage \
    bootstrap/cache

# Laravel package discovery
RUN php artisan package:discover --ansi

EXPOSE 80

CMD ["apache2-foreground"]