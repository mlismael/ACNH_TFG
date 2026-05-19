<?php

class ColeccionablesUsuarioController
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

        require 'models/ColeccionablesUsuarioModel.php';
        $modelo = new ColeccionablesUsuarioModel();
        echo json_encode(['status' => 'success', 'data' => $modelo->getByUsuario($_REQUEST['id_usuario'])]);
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
        $required = ['id_usuario', 'id_tipo', 'id_api', 'nombre'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => "$field requerido"]);
                exit;
            }
        }

        require 'models/ColeccionablesUsuarioModel.php';
        $modelo = new ColeccionablesUsuarioModel();
        $ok = $modelo->crear(
            $input['id_usuario'],
            $input['id_tipo'],
            $input['id_api'],
            $input['nombre'],
            $input['imagen'] ?? ''
        );

        if ($ok) {
            echo json_encode(['status' => 'success', 'message' => 'Coleccionable creado']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error al crear']);
        }
    }

    public function eliminar()
    {
        $this->setCorsHeaders();

        // Recogemos los parámetros de identificación única
        $id_usuario = $_REQUEST['id_usuario'] ?? null;
        $id_api = $_REQUEST['id_api'] ?? null;

        if (empty($id_usuario) || empty($id_api)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Usuario e ID de API requeridos']);
            exit;
        }

        require 'models/ColeccionablesUsuarioModel.php';
        $modelo = new ColeccionablesUsuarioModel();

        // Intentamos eliminar basándonos en la relación
        if ($modelo->eliminar($id_usuario, $id_api)) {
            echo json_encode(['status' => 'success', 'message' => 'Coleccionable eliminado']);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'No se encontró el registro para este usuario']);
        }
    }
}
