<?php

class AldeanosUsuarioController
{
    public function listarPorUsuario()
    {
        if (empty($_REQUEST['id_usuario'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'id_usuario requerido']);
            exit;
        }

        require 'models/AldeanosUsuarioModel.php';
        $modelo = new AldeanosUsuarioModel();
        echo json_encode(['status' => 'success', 'data' => $modelo->getByIdUsuario($_REQUEST['id_usuario'])]);
    }

    public function crear()
    {
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
            $input['url_api']        ?? '',
            $input['nombre_aldeano'],
            $input['imagen_aldeano'] ?? '',
            $input['personalidad']   ?? ''
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
        $id_usuario = $_REQUEST['id_usuario'] ?? null;
        $id_api     = $_REQUEST['id_api']     ?? null;

        if (empty($id_usuario) || empty($id_api)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Usuario e ID de API requeridos']);
            exit;
        }

        require 'models/AldeanosUsuarioModel.php';
        $modelo = new AldeanosUsuarioModel();

        if ($modelo->eliminar($id_usuario, $id_api)) {
            echo json_encode(['status' => 'success', 'message' => 'Aldeano eliminado de favoritos']);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'No se encontró el aldeano para este usuario']);
        }
    }
}