<?php
// Clase que hereda de PDO y que instancia la conexión a la BD con PDO
// Utiliza el patrón Singleton para que en la aplicación web únicamente
// exista una instancia de dicha conexión a la BD
class SPDO extends PDO
{
    // Atributo que es la referencia a la instancia del objeto PDO con la conexión
    private static $instance = null;

    // Constructor que usa el patrón Singleton de Config para obtener la configuración
    // y llama al constructor de la clase padre, que es PDO, con los parámetros de Config
    public function __construct()
    {
        $config = Config::singleton();
        // Añadimos el parámetro ;port= dinámicamente en el string de conexión
        parent::__construct(
            'mysql:host=' . $config->get('dbhost') . ';port=' . $config->get('dbport') . ';dbname=' . $config->get('dbname'),
            $config->get('dbuser'), 
            $config->get('dbpass')
        );
    }

    // Método estático para el patrón Singleton que devuelve la instancia de SPDO
    public static function singleton()
    {
        if (self::$instance == null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
}
?>