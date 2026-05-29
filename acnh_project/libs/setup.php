<?php
// Script para configurar la aplicación web
// Establece las variables que indican los directorios de las clases
// Establece las variables para hacer la conexión a la base de datos

// Obtiene la instancia del objeto que guarda los datos de configuración
$config = Config::singleton();

// Carpetas para los Controladores y los Modelos
$config->set('controllersFolder', 'controllers/');
$config->set('modelsFolder', 'models/');

/**
 * CONFIGURACIÓN DE LA BASE DE DATOS (Híbrida Local / Railway)
 * * getenv() lee las variables automáticas que Railway inyecta en el servidor.
 * Si no encuentra ninguna (entorno local en Mac), aplica los valores por defecto tras el elvis operator (?:).
 */
$config->set('dbhost', getenv('MYSQLHOST')     ?: '127.0.0.1');
$config->set('dbname', getenv('MYSQLDATABASE') ?: 'acnh_project'); 
$config->set('dbuser', getenv('MYSQLUSER')     ?: 'root');
$config->set('dbpass', getenv('MYSQLPASSWORD') ?: getenv('MYSQL_ROOT_PASSWORD') ?: '');
$config->set('dbport', getenv('MYSQLPORT')     ?: '3306'); // Añadimos el puerto por seguridad de Railway

// Configuración de Nookipedia (token privado)
$config->set('nookipedia_base_url', 'https://api.nookipedia.com');
$config->set('nookipedia_token', getenv('NOOKIPEDIA_TOKEN') ?: 'c4cc65ef-eac4-4574-8927-5ad618575787');
?>