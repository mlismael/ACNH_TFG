<?php

class AldeanosUsuarioController
{
    private function setCorsHeaders()
    {
        header('Access-Control-Allow-Origin: http://localhost:4200');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    public function listarPorUsuario()
    {
        $this->setCorsHeaders();

        if (empty($_REQUEST['id_usuario'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'id_usuario requerido']);
            exit;
        }

        require 'models/AldeanosUsuarioModel.php';
        $modelo = new AldeanosUsuarioModel();
        $items = $modelo->getByIdUsuario($_REQUEST['id_usuario']);

        echo json_encode(['status' => 'success', 'data' => $items]);
    }

    public function crear()
    {
        $this->setCorsHeaders();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $required = ['id_usuario', 'id_api', 'nombre_aldeano'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => "$field requerido"]);
                exit;
            }
        }

        require 'models/AldeanosUsuarioModel.php';
        $modelo = new AldeanosUsuarioModel();
        $ok = $modelo->crear(
            $input['id_usuario'],
            $input['id_api'],
            $input['url_api'] ?? '',
            $input['nombre_aldeano'],
            $input['imagen_aldeano'] ?? '',
            $input['personalidad'] ?? ''
        );

        if ($ok) {
            echo json_encode(['status' => 'success', 'message' => 'Aldeano creado']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error al crear']);
        }
    }

    public function eliminar()
    {
        $this->setCorsHeaders();

        // Recogemos los nuevos parámetros
        $id_usuario = $_REQUEST['id_usuario'] ?? null;
        $id_api = $_REQUEST['id_api'] ?? null;

        // Validamos que ambos existan
        if (empty($id_usuario) || empty($id_api)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Usuario e ID de API requeridos']);
            exit;
        }

        require 'models/AldeanosUsuarioModel.php';
        $modelo = new AldeanosUsuarioModel();

        // Enviamos ambos al modelo
        if ($modelo->eliminar($id_usuario, $id_api)) {
            echo json_encode(['status' => 'success', 'message' => 'Aldeano eliminado de favoritos']);
        } else {
            // Si no se borró nada, puede ser que la relación no existiera
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'No se encontró el aldeano para este usuario']);
        }
    }
}
