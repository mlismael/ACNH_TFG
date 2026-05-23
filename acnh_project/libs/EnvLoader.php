<?php
// EnvLoader.php - Cargador de variables de entorno

class EnvLoader
{
    private static $env = [];
    private static $loaded = false;

    /**
     * Carga las variables de entorno desde archivos .env
     * Las variables del sistema (Railway) siempre tienen prioridad sobre el fichero
     */
    public static function load()
    {
        if (self::$loaded) {
            return;
        }

        // Leer APP_ENV directamente del sistema ANTES de cargar ningún fichero
        // Así Railway puede controlar qué fichero se usa (o ninguno)
        $app_env = getenv('APP_ENV');

        // En producción (Railway inyecta APP_ENV=production) no cargamos ningún fichero:
        // todas las variables vienen del sistema directamente
        if ($app_env !== 'production') {
            $env_file = '.env.local';
            $env_path = dirname(__FILE__) . '/../' . $env_file;

            if (file_exists($env_path)) {
                self::parseEnvFile($env_path);
            }
        }

        self::$loaded = true;
    }

    /**
     * Parsea un archivo .env y carga las variables
     * Solo se llama en entorno local
     */
    private static function parseEnvFile($file)
    {
        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key   = trim($key);
                $value = trim($value);

                self::$env[$key] = $value;
                $_ENV[$key]      = $value;
                putenv("$key=$value");
            }
        }
    }

    /**
     * Obtiene una variable de entorno.
     * Orden de prioridad: sistema (getenv / $_SERVER) > fichero .env > default
     * Esto garantiza que Railway siempre gana sobre cualquier fichero
     */
    public static function get($key, $default = '')
    {
        // 1. Variable del sistema (Railway, Apache, etc.)
        $sysValue = getenv($key);
        if ($sysValue !== false && $sysValue !== '') {
            return $sysValue;
        }

        if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
            return $_SERVER[$key];
        }

        if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
            return $_ENV[$key];
        }

        // 2. Fichero .env local (solo en desarrollo)
        if (isset(self::$env[$key]) && self::$env[$key] !== '') {
            return self::$env[$key];
        }

        return $default;
    }

    /**
     * Obtiene los orígenes CORS permitidos como array
     */
    public static function getAllowedOrigins()
    {
        $default = getenv('APP_ENV') === 'production'
            ? 'https://acnh-tfg.vercel.app'
            : 'http://localhost:4200';

        $origins_str = self::get('ALLOWED_ORIGINS', $default);
        return array_map('trim', explode(',', $origins_str));
    }
}
