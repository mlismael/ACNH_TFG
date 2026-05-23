FROM php:8.2-apache

# Instalar extensión pdo_mysql
RUN docker-php-ext-install pdo pdo_mysql

# Copiar el proyecto
COPY . /var/www/html/

# Permisos
RUN chown -R www-data:www-data /var/www/html