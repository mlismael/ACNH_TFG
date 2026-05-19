<?php
// FrontController - Controlador frontal para API REST en JSON
// Enruta las peticiones a los controladores correspondientes

class FrontController {
      static function main() {
            // Incluimos las clases necesarias
            require 'libs/Config.php';
            require 'libs/SPDO.php';
            require 'setup.php';

            // Establecemos header JSON y CORS por defecto
            header('Content-Type: application/json; charset=utf-8');
            header('Access-Control-Allow-Origin: http://localhost:4200');
            header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
            header('Access-Control-Allow-Credentials: true');

            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                  http_response_code(204);
                  exit;
            }

            // Formamos el nombre del Controlador
            if (!empty($_REQUEST['controlador']))
                  $controllerName = $_REQUEST['controlador'] . 'Controller';
            else
                  $controllerName = "AppController";

            // La acción, si no hay, usamos index como acción por defecto
            if (!empty($_REQUEST['accion']))
                  $actionName = $_REQUEST['accion'];
            else
                  $actionName = "index";

            // Obtenemos la ruta a la carpeta con los controladores
            $config = Config::singleton();
            $controllerPath = $config->get('controllersFolder') . $controllerName . '.php';

            // Incluimos el fichero que contiene nuestro controlador
            if (is_file($controllerPath))
                  require $controllerPath;
            else {
                  http_response_code(404);
                  echo json_encode(['status' => 'error', 'message' => 'Controlador no encontrado']);
                  exit;
            }

            // Creamos una instancia del controlador y llamamos a la acción
            if (class_exists($controllerName) && method_exists($controllerName, $actionName)) {
                  $controller = new $controllerName();
                  $controller->$actionName();
            } else {
                  http_response_code(404);
                  echo json_encode(['status' => 'error', 'message' => 'Acción no encontrada']);
                  exit;
            }
      }
}
?>
