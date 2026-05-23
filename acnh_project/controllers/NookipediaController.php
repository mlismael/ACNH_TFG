<?php

class NookipediaController
{
    private function respond($payload, $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($payload);
        exit;
    }

    public function listarAldeanos()
    {
        require 'libs/NookipediaClient.php';

        $client = new NookipediaClient();
        $params = [];

        if (!empty($_REQUEST['search']))      $params['name']        = $_REQUEST['search'];
        if (!empty($_REQUEST['personality'])) $params['personality'] = $_REQUEST['personality'];
        if (!empty($_REQUEST['species']))     $params['species']     = $_REQUEST['species'];

        $result = $client->get('/villagers', $params);
        if (isset($result['error'])) {
            $this->respond(['status' => 'error', 'message' => $result['error']], 500);
        }

        $this->respond(['status' => 'success', 'data' => $result['data']], $result['status']);
    }

    public function listarColeccionables()
    {
        require 'libs/NookipediaClient.php';

        if (empty($_REQUEST['type'])) {
            $this->respond(['status' => 'error', 'message' => 'type requerido: bugs|fish|sea'], 400);
        }

        $resource = $_REQUEST['type'];
        if (!in_array($resource, ['bugs', 'fish', 'sea'], true)) {
            $this->respond(['status' => 'error', 'message' => 'type inválido'], 400);
        }

        $params = [];
        if (!empty($_REQUEST['name'])) $params['name'] = $_REQUEST['name'];

        $client = new NookipediaClient();
        $result = $client->get('/nh/' . $resource, $params);
        if (isset($result['error'])) {
            $this->respond(['status' => 'error', 'message' => $result['error']], 500);
        }

        $this->respond(['status' => 'success', 'data' => $result['data']], $result['status']);
    }

    public function listarEventos()
    {
        require 'libs/NookipediaClient.php';

        $params = [];
        if (!empty($_REQUEST['date']))  $params['date']  = $_REQUEST['date'];
        if (!empty($_REQUEST['year']))  $params['year']  = $_REQUEST['year'];
        if (!empty($_REQUEST['month'])) $params['month'] = $_REQUEST['month'];
        if (!empty($_REQUEST['day']))   $params['day']   = $_REQUEST['day'];

        $client = new NookipediaClient();
        $result = $client->get('/nh/events', $params);
        if (isset($result['error'])) {
            $this->respond(['status' => 'error', 'message' => $result['error']], 500);
        }

        $this->respond(['status' => 'success', 'data' => $result['data']], $result['status']);
    }
}
