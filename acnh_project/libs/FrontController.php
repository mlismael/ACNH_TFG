<?php
// FrontController - Controlador frontal para API REST en JSON

class FrontController {
      static function main() {
            // --- CONFIGURACIÓN DE CORS DUAL ROBUSTA ---
            $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

            // Forzamos el origen dinámico exacto si coincide con nuestras dos URLs válidas
            if ($origin === 'http://localhost:4200' || $origin === 'https://acnh-tfg.vercel.app') {
                header("Access-Control-Allow-Origin: " . $origin);
            } else {
                // Comodín seguro para evitar que el navegador bloquee las respuestas por defecto
                header("Access-Control-Allow-Origin: https://acnh-tfg.vercel.app");
            }

            // Cabeceras estándar e imprescindibles para peticiones HTTP
            header('Content-Type: application/json; charset=utf-8');
            header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
            header('Access-Control-Allow-Credentials: true');

            // Si es una petición previa de Angular (OPTIONS), respondemos 200 directo y paramos
            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                  http_response_code(200);
                  exit;
            }

            // --- RESTO DEL CÓDIGO DE TU FRONTCONTROLLER ---
            require 'libs/Config.php';
            require 'libs/SPDO.php';
            require 'setup.php';

            if (!empty($_REQUEST['controlador']))
                  $controllerName = $_REQUEST['controlador'] . 'Controller';
            else
                  $controllerName = "AppController";

            if (!empty($_REQUEST['accion']))
                  $actionName = $_REQUEST['accion'];
            else
                  $actionName = "index";

            $config = Config::singleton();
            $controllerPath = $config->get('controllersFolder') . $controllerName . '.php';

            if (is_file($controllerPath))
                  require $controllerPath;
            else {
                  http_response_code(404);
                  echo json_encode(['status' => 'error', 'message' => 'Controlador no encontrado']);
                  exit;
            }

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