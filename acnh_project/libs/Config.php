<?php
/*
Clase para gestionar variables de configuración de la aplicación web
mediante un atributo que es "vars" y que es un array de variables.
 
*/
class Config
{
    private $vars;
    private static $instance;
 
    // Constructor de la clase, instancia vars como un array
    private function __construct()
    {
        $this->vars = array();
    }
 
    //Con set vamos guardando nuestras variables.
    public function set($name, $value)
    {
        if(!isset($this->vars[$name]))
        {
            $this->vars[$name] = $value;
        }
    }
 
    //Con get('nombre_de_la_variable') recuperamos un valor.
    public function get($name)
    {
        if(isset($this->vars[$name]))
        {
            return $this->vars[$name];
        }
    }
 
    // Método estático para asegurarnos que solo tenemos una instancia de Config
    // Sigue el patrón de diseño Singleton
    public static function singleton()
    {
        if (!isset(self::$instance)) {
            $c = __CLASS__;
            self::$instance = new $c;
        }
 
        return self::$instance;
    }
}
?>
