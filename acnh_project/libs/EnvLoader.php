<?php
// EnvLoader.php - Cargador de variables de entorno

class EnvLoader {
    private static $env = [];
    private static $loaded = false;

    /**
     * Carga las variables de entorno desde archivos .env
     */
    public static function load() {
        if (self::$loaded) {
            return;
        }

        // Detectar entorno
        $env_file = getenv('APP_ENV') === 'production' ? '.env.production' : '.env.local';
        $env_path = dirname(__FILE__) . '/../' . $env_file;

        // Si el archivo existe, cargarlo
        if (file_exists($env_path)) {
            self::parseEnvFile($env_path);
        }

        self::$loaded = true;
    }

    /**
     * Parsea un archivo .env y carga las variables
     */
    private static function parseEnvFile($file) {
        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            // Ignorar comentarios
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            // Parsear línea KEY=VALUE
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);

                // Guardar en array
                self::$env[$key] = $value;
                
                // Opcionalmente, también set en $_ENV y putenv
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
    }

    /**
     * Obtiene una variable de entorno
     */
    public static function get($key, $default = '') {
        if (isset(self::$env[$key])) {
            return self::$env[$key];
        }

        $envValue = getenv($key);
        if ($envValue !== false) {
            return $envValue;
        }

        return $default;
    }

    /**
     * Obtiene valores CORS como array
     */
    public static function getAllowedOrigins() {
        $origins_str = self::get('ALLOWED_ORIGINS', 'http://localhost:4200');
        return array_map('trim', explode(',', $origins_str));
    }
}
?>
