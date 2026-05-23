<?php

class UsuarioController
{
    public function ver()
    {
        if (empty($_REQUEST['id'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID requerido']);
            exit;
        }

        require_once 'models/UsuarioModel.php';
        $modelo = new UsuarioModel();
        $user = $modelo->getById($_REQUEST['id']);

        if (!$user) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado']);
            exit;
        }

        echo json_encode(['status' => 'success', 'data' => $user]);
    }

    public function crear()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $required = ['username', 'email', 'password'];

        foreach ($required as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => "$field requerido"]);
                exit;
            }
        }

        require_once 'models/UsuarioModel.php';
        $modelo = new UsuarioModel();

        if ($modelo->existeUsuario($input['username'], $input['email'])) {
            http_response_code(409);
            echo json_encode(['status' => 'error', 'message' => 'El nombre de usuario o email ya están registrados']);
            exit;
        }

        $ok = $modelo->crear($input['username'], $input['password'], $input['email']);

        if ($ok) {
            echo json_encode(['status' => 'success', 'message' => 'Usuario creado']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error al crear usuario']);
        }
    }

    public function login()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $required = ['username', 'password'];

        foreach ($required as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => "$field requerido"]);
                exit;
            }
        }

        require_once 'models/UsuarioModel.php';
        $modelo = new UsuarioModel();
        $usuario = $modelo->getByLogin($input['username']);

        if (!$usuario) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Credenciales inválidas']);
            exit;
        }

        if (!password_verify($input['password'], $usuario['password'])) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Credenciales inválidas']);
            exit;
        }

        unset($usuario['password']);
        echo json_encode([
            'status'  => 'success',
            'message' => 'Login exitoso',
            'data'    => [
                'user'  => $usuario,
                'token' => bin2hex(random_bytes(32))
            ]
        ]);
    }

    public function actualizar()
    {
        if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PATCH'])) {
            http_response_code(405);
            echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
            exit;
        }

        if (empty($_REQUEST['id'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID requerido']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        require_once 'models/UsuarioModel.php';
        $modelo = new UsuarioModel();

        $updateData = [];
        if (!empty($input['username']))    $updateData['username']    = $input['username'];
        if (!empty($input['email']))       $updateData['email']       = $input['email'];
        if (!empty($input['img_perfil']))  $updateData['img_perfil']  = $input['img_perfil'];
        if (!empty($input['nombre_isla'])) $updateData['nombre_isla'] = $input['nombre_isla'];
        if (!empty($input['color_tema']))  $updateData['color_tema']  = $input['color_tema'];
        if (!empty($input['password']))    $updateData['password']    = $input['password'];

        if (empty($updateData)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'No hay datos para actualizar']);
            exit;
        }

        $ok = $modelo->actualizar($_REQUEST['id'], $updateData);

        if ($ok) {
            echo json_encode(['status' => 'success', 'message' => 'Usuario actualizado']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error al actualizar usuario']);
        }
    }
}