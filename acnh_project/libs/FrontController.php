<?php
// FrontController - Controlador frontal para API REST en JSON

class FrontController {
      static function main() {
            // --- CONFIGURACIÓN DE CORS DUAL ROBUSTA ---
            // IMPORTANTE: Estos headers DEBEN ir antes de cualquier output
            
            // Lista blanca de orígenes permitidos
            $allowed_origins = [
                  'http://localhost:4200',
                  'http://localhost',
                  'https://acnh-tfg.vercel.app',
                  'https://acnhtfg-production.up.railway.app'
            ];
            
            $origin = isset($_SERVER['HTTP_ORIGIN']) ? trim($_SERVER['HTTP_ORIGIN']) : '';
            
            // Si el origen está en la lista blanca, lo enviamos; si no, enviamos Vercel como default
            if (in_array($origin, $allowed_origins, true)) {
                  header("Access-Control-Allow-Origin: " . $origin, true);
            } else if (!empty($origin)) {
                  // Si viene un origin que no reconocemos, logramos para debuggear
                  error_log("CORS: Origin no permitido: " . $origin);
                  header("Access-Control-Allow-Origin: https://acnh-tfg.vercel.app", true);
            } else {
                  header("Access-Control-Allow-Origin: https://acnh-tfg.vercel.app", true);
            }

            // Cabeceras estándar e imprescindibles para peticiones HTTP
            header('Content-Type: application/json; charset=utf-8', true);
            header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS', true);
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept', true);
            header('Access-Control-Allow-Credentials: true', true);
            header('Access-Control-Max-Age: 86400', true);

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