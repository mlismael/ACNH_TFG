<?php

// Modelo Usuario: gestiona la autenticación y datos de usuarios
class UsuarioModel
{
    // Conexión a la BD
    protected $db;

    // Atributos del objeto usuario
    private $codigo;
    private $login;
    private $password;
    private $email;

    // Constructor
    public function __construct()
    {
        $this->db = SPDO::singleton();
    }

    // ===== GETTERS Y SETTERS =====
    public function getCodigo()
    {
        return $this->codigo;
    }
    public function setCodigo($codigo)
    {
        return $this->codigo = $codigo;
    }

    public function getLogin()
    {
        return $this->login;
    }
    public function setLogin($login)
    {
        return $this->login = $login;
    }

    public function getEmail()
    {
        return $this->email;
    }
    public function setEmail($email)
    {
        return $this->email = $email;
    }

    // ===== MÉTODOS DE BD =====

    public function getAll()
    {
        $consulta = $this->db->prepare('SELECT id, username, email, img_perfil, nombre_isla, color_tema, fecha_registro, fecha_actualizacion, activo FROM USUARIO');
        $consulta->execute();
        return $consulta->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $gsent = $this->db->prepare('SELECT id, username, email, img_perfil, nombre_isla, color_tema, fecha_registro, fecha_actualizacion, activo FROM USUARIO WHERE id = ?');
        $gsent->bindParam(1, $id);
        $gsent->execute();
        return $gsent->fetch(PDO::FETCH_ASSOC);
    }

    public function getByLogin($username)
    {
        $gsent = $this->db->prepare('SELECT id, username, email, img_perfil, password, nombre_isla, color_tema, fecha_registro, fecha_actualizacion, activo FROM USUARIO WHERE username = ?');
        $gsent->bindParam(1, $username);
        $gsent->execute();
        return $gsent->fetch(PDO::FETCH_ASSOC);
    }

    // Método para autenticar un usuario
    public function autenticar($username, $password): bool
    {
        $gsent = $this->db->prepare('SELECT * FROM USUARIO WHERE username = ?');
        $gsent->bindParam(1, $username);
        $gsent->execute();
        $user = $gsent->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            return password_verify($password, $user['password']);
        }
        return false;
    }

    // Método para crear un nuevo usuario
    public function crear($username, $password, $email): bool
    {
        try {
            $password_encrypt = password_hash($password, PASSWORD_BCRYPT);
            $gsent = $this->db->prepare('INSERT INTO USUARIO (username, password, email) VALUES (?, ?, ?)');
            $gsent->bindParam(1, $username);
            $gsent->bindParam(2, $password_encrypt);
            $gsent->bindParam(3, $email);
            return $gsent->execute();
        } catch (Exception $e) {
            return false;
        }
    }

    // Método para comprobar si un usuario o email ya existen
    public function existeUsuario($username, $email): bool
    {
        try {
            $gsent = $this->db->prepare('SELECT id FROM USUARIO WHERE username = ? OR email = ? LIMIT 1');
            $gsent->bindParam(1, $username);
            $gsent->bindParam(2, $email);
            $gsent->execute();

            $resultado = $gsent->fetch(PDO::FETCH_ASSOC);

            // Si $resultado es false, no encontró nada. Si tiene un array, es que ya existe.
            return $resultado !== false;
        } catch (Exception $e) {
            // En caso de error de conexión/sintaxis, asumimos que no se debe proceder
            // Puedes registrar el log del error aquí si tienes un sistema de logs
            return true;
        }
    }

    // Método para actualizar datos del usuario
    // Método para actualizar datos del usuario
    public function actualizar($id, $updateData): bool
    {
        try {
            if (empty($updateData)) {
                return false;
            }

            $campos = [];
            $valores = [];

            if (isset($updateData['username'])) {
                $campos[] = 'username = ?';
                $valores[] = $updateData['username'];
            }
            if (isset($updateData['email'])) {
                $campos[] = 'email = ?';
                $valores[] = $updateData['email'];
            }
            if (isset($updateData['img_perfil'])) {
                $campos[] = 'img_perfil = ?';
                $valores[] = $updateData['img_perfil'];
            }
            if (isset($updateData['nombre_isla'])) {
                $campos[] = 'nombre_isla = ?';
                $valores[] = $updateData['nombre_isla'];
            }
            if (isset($updateData['color_tema'])) {
                $campos[] = 'color_tema = ?';
                $valores[] = $updateData['color_tema'];
            }
            if (isset($updateData['password'])) {
                $campos[] = 'password = ?';
                $valores[] = password_hash($updateData['password'], PASSWORD_BCRYPT);
            }

            if (empty($campos)) {
                return false;
            }

            $campos[] = 'fecha_actualizacion = NOW()';
            $valores[] = $id;

            $sql = 'UPDATE USUARIO SET ' . implode(', ', $campos) . ' WHERE id = ?';
            $gsent = $this->db->prepare($sql);

            // Ejecución limpia directa con el array
            return $gsent->execute($valores);
        } catch (Exception $e) {
            // Se registra el error silenciosamente en el log del servidor
            error_log("Error BD al actualizar usuario: " . $e->getMessage());
            return false;
        }
    }
}
