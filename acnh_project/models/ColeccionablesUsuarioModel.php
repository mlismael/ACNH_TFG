<?php

class ColeccionablesUsuarioModel
{
    protected $db;
    private $id;
    private $id_usuario;
    private $id_tipo;
    private $id_api;
    private $nombre;
    private $imagen;
    private $fecha_captura;

    public function __construct()
    {
        $this->db = SPDO::singleton();
    }

    public function getAll()
    {
        $consulta = $this->db->prepare('SELECT * FROM COLECCIONABLES_USUARIO');
        $consulta->execute();
        return $consulta->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $gsent = $this->db->prepare('SELECT * FROM COLECCIONABLES_USUARIO WHERE id = ?');
        $gsent->bindParam(1, $id);
        $gsent->execute();
        return $gsent->fetch(PDO::FETCH_ASSOC);
    }

    public function getByUsuario($id_usuario)
    {
        $gsent = $this->db->prepare('SELECT * FROM COLECCIONABLES_USUARIO WHERE id_usuario = ?');
        $gsent->bindParam(1, $id_usuario);
        $gsent->execute();
        return $gsent->fetchAll(PDO::FETCH_ASSOC);
    }

    public function crear($id_usuario, $id_tipo, $id_api, $nombre, $imagen)
    {
        try {
            $gsent = $this->db->prepare('INSERT INTO COLECCIONABLES_USUARIO (id_usuario, id_tipo, id_api, nombre, imagen) VALUES (?, ?, ?, ?, ?)');
            $gsent->bindParam(1, $id_usuario);
            $gsent->bindParam(2, $id_tipo);
            $gsent->bindParam(3, $id_api);
            $gsent->bindParam(4, $nombre);
            $gsent->bindParam(5, $imagen);
            return $gsent->execute();
        } catch (Exception $e) {
            return false;
        }
    }

    public function actualizar($id, $id_tipo, $id_api, $nombre, $imagen)
    {
        try {
            $gsent = $this->db->prepare('UPDATE COLECCIONABLES_USUARIO SET id_tipo = ?, id_api = ?, nombre = ?, imagen = ? WHERE id = ?');
            $gsent->bindParam(1, $id_tipo);
            $gsent->bindParam(2, $id_api);
            $gsent->bindParam(3, $nombre);
            $gsent->bindParam(4, $imagen);
            $gsent->bindParam(5, $id);
            return $gsent->execute();
        } catch (Exception $e) {
            return false;
        }
    }

    public function eliminar($id_usuario, $id_api)
    {
        try {
            // Borramos solo si coinciden el dueño y el item
            $sql = 'DELETE FROM COLECCIONABLES_USUARIO WHERE id_usuario = ? AND id_api = ?';
            $gsent = $this->db->prepare($sql);

            // Ejecutamos pasando ambos parámetros
            $gsent->execute([$id_usuario, $id_api]);

            // Retornamos true si realmente se borró una fila
            return $gsent->rowCount() > 0;
        } catch (Exception $e) {
            error_log("Error al eliminar coleccionable: " . $e->getMessage());
            return false;
        }
    }
}
