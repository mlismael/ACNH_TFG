<?php

// Modelo AldeanosUsuario: gestiona la relación aldeano-usuario (CRUD)
class AldeanosUsuarioModel
{
    protected $db;

    private $id;
    private $id_usuario;
    private $id_api;
    private $url_api;
    private $nombre_aldeano;
    private $imagen_aldeano;
    private $personalidad;
    private $fecha_incorporacion;

    public function __construct()
    {
        $this->db = SPDO::singleton();
    }

    // Getters y setters
    public function getId()
    {
        return $this->id;
    }
    public function setId($id)
    {
        $this->id = $id;
    }

    public function getIdUsuario()
    {
        return $this->id_usuario;
    }
    public function setIdUsuario($id_usuario)
    {
        $this->id_usuario = $id_usuario;
    }

    public function getIdApi()
    {
        return $this->id_api;
    }
    public function setIdApi($id_api)
    {
        $this->id_api = $id_api;
    }

    public function getUrlApi()
    {
        return $this->url_api;
    }
    public function setUrlApi($url_api)
    {
        $this->url_api = $url_api;
    }

    public function getNombreAldeano()
    {
        return $this->nombre_aldeano;
    }
    public function setNombreAldeano($nombre_aldeano)
    {
        $this->nombre_aldeano = $nombre_aldeano;
    }

    public function getImagenAldeano()
    {
        return $this->imagen_aldeano;
    }
    public function setImagenAldeano($imagen_aldeano)
    {
        $this->imagen_aldeano = $imagen_aldeano;
    }

    public function getPersonalidad()
    {
        return $this->personalidad;
    }
    public function setPersonalidad($personalidad)
    {
        $this->personalidad = $personalidad;
    }

    public function getFechaIncorporacion()
    {
        return $this->fecha_incorporacion;
    }
    public function setFechaIncorporacion($fecha_incorporacion)
    {
        $this->fecha_incorporacion = $fecha_incorporacion;
    }

    // Métodos de BD
    public function getAll()
    {
        $consulta = $this->db->prepare('SELECT * FROM ALDEANOS_USUARIO');
        $consulta->execute();
        return $consulta->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $gsent = $this->db->prepare('SELECT * FROM ALDEANOS_USUARIO WHERE id = ?');
        $gsent->bindParam(1, $id);
        $gsent->execute();
        return $gsent->fetch(PDO::FETCH_ASSOC);
    }

    public function getByIdUsuario($id_usuario)
    {
        $gsent = $this->db->prepare('SELECT * FROM ALDEANOS_USUARIO WHERE id_usuario = ?');
        $gsent->bindParam(1, $id_usuario);
        $gsent->execute();
        return $gsent->fetchAll(PDO::FETCH_ASSOC);
    }

    public function contarPorUsuario($id_usuario)
    {
        $gsent = $this->db->prepare('SELECT COUNT(*) as total FROM ALDEANOS_USUARIO WHERE id_usuario = ?');
        $gsent->bindParam(1, $id_usuario);
        $gsent->execute();
        $result = $gsent->fetch(PDO::FETCH_ASSOC);
        return (int) $result['total'];
    }

    public function crear($id_usuario, $id_api, $url_api, $nombre_aldeano, $imagen_aldeano, $personalidad)
    {
        try {
            // Verificar que el usuario no tenga ya 10 aldeanos
            $totalAldeanos = $this->contarPorUsuario($id_usuario);
            if ($totalAldeanos >= 10) {
                throw new Exception('El usuario ya tiene el máximo de 10 aldeanos permitidos');
            }

            $gsent = $this->db->prepare('INSERT INTO ALDEANOS_USUARIO (id_usuario, id_api, url_api, nombre_aldeano, imagen_aldeano, personalidad) VALUES (?, ?, ?, ?, ?, ?)');
            $gsent->bindParam(1, $id_usuario);
            $gsent->bindParam(2, $id_api);
            $gsent->bindParam(3, $url_api);
            $gsent->bindParam(4, $nombre_aldeano);
            $gsent->bindParam(5, $imagen_aldeano);
            $gsent->bindParam(6, $personalidad);
            return $gsent->execute();
        } catch (Exception $e) {
            return false;
        }
    }

    public function actualizar($id, $id_api, $url_api, $nombre_aldeano, $imagen_aldeano, $personalidad)
    {
        try {
            $gsent = $this->db->prepare('UPDATE ALDEANOS_USUARIO SET id_api = ?, url_api = ?, nombre_aldeano = ?, imagen_aldeano = ?, personalidad = ? WHERE id = ?');
            $gsent->bindParam(1, $id_api);
            $gsent->bindParam(2, $url_api);
            $gsent->bindParam(3, $nombre_aldeano);
            $gsent->bindParam(4, $imagen_aldeano);
            $gsent->bindParam(5, $personalidad);
            $gsent->bindParam(6, $id);
            return $gsent->execute();
        } catch (Exception $e) {
            return false;
        }
    }

    public function eliminar($id_usuario, $id_api)
    {
        try {
            // Cambiamos la consulta para validar ambos campos
            $sql = 'DELETE FROM ALDEANOS_USUARIO WHERE id_usuario = ? AND id_api = ?';
            $gsent = $this->db->prepare($sql);

            // Vinculamos los dos parámetros
            $gsent->bindParam(1, $id_usuario);
            $gsent->bindParam(2, $id_api);

            $gsent->execute();

            // Es buena práctica retornar true solo si realmente se borró algo
            // rowCount() nos dice cuántas filas se eliminaron
            return $gsent->rowCount() > 0;
        } catch (Exception $e) {
            // Opcional: puedes registrar el error $e->getMessage() para debug
            return false;
        }
    }
}
