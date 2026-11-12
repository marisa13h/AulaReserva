
<?php

header('Content-Type: application/json; charset=utf-8');

// CORS para Live Server
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Responder a las peticiones previas CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Conectar con SQLite
try {
    $pdo = require __DIR__ . '/../src/bootstrap.php';
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al conectar con la base de datos'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Obtener método y ruta
$metodo = $_SERVER['REQUEST_METHOD'];
$ruta = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Función para devolver JSON
function responder($codigo, $datos) {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

// GET /api/health
if ($metodo === 'GET' && $ruta === '/api/health') {
    responder(200, [
        'ok' => true
    ]);
}

// GET /api/aulas
if ($metodo === 'GET' && $ruta === '/api/aulas') {

    $consulta = $pdo->query(
        'SELECT id, nombre, capacidad, ubicacion
         FROM aulas
         ORDER BY id'
    );

    responder(200, $consulta->fetchAll());
}

// POST /api/reservas
if ($metodo === 'POST' && $ruta === '/api/reservas') {

    $datos = json_decode(file_get_contents('php://input'), true);

    if (
        !is_array($datos) ||
        empty($datos['aula']) ||
        empty($datos['fecha']) ||
        empty($datos['hora']) ||
        empty(trim($datos['responsable'] ?? ''))
    ) {
        responder(400, [
            'error' => 'Faltan datos obligatorios para la reserva'
        ]);
    }

    try {

        $consulta = $pdo->prepare(
            'INSERT INTO reservas
             (aula_id, fecha, hora, responsable)
             VALUES (:aula, :fecha, :hora, :responsable)'
        );

        $consulta->execute([
            ':aula' => $datos['aula'],
            ':fecha' => $datos['fecha'],
            ':hora' => $datos['hora'],
            ':responsable' => trim($datos['responsable'])
        ]);

        $id = $pdo->lastInsertId();

        responder(201, [
            'mensaje' => 'Reserva recibida correctamente',
            'reserva' => [
                'id' => (int) $id,
                'aula' => (int) $datos['aula'],
                'fecha' => $datos['fecha'],
                'hora' => $datos['hora'],
                'responsable' => trim($datos['responsable'])
            ]
        ]);

    } catch (PDOException $e) {

        // Comprobar si la reserva está duplicada
        if (str_contains($e->getMessage(), 'UNIQUE constraint failed')) {
            responder(409, [
                'error' => 'El aula ya está reservada en esa fecha y hora'
            ]);
        }

        // Comprobar si el aula no existe
        if (str_contains($e->getMessage(), 'FOREIGN KEY constraint failed')) {
            responder(400, [
                'error' => 'El aula indicada no existe'
            ]);
        }

        // Cualquier otro error
        responder(500, [
            'error' => 'Error al guardar la reserva'
        ]);
    }
}

// GET /api/reservas
if ($metodo === 'GET' && $ruta === '/api/reservas') {

    $consulta = $pdo->query(
        'SELECT
            reservas.id,
            reservas.aula_id,
            aulas.nombre AS aula,
            reservas.fecha,
            reservas.hora,
            reservas.responsable,
            reservas.creado_en
         FROM reservas
         INNER JOIN aulas ON reservas.aula_id = aulas.id
         ORDER BY reservas.fecha, reservas.hora'
    );

    responder(200, $consulta->fetchAll());
}

// DELETE /api/reservas/{id}
if (
    $metodo === 'DELETE' &&
    preg_match('#^/api/reservas/([0-9]+)$#', $ruta, $coincidencias)
) {

    $id = (int) $coincidencias[1];

    $consulta = $pdo->prepare(
        'DELETE FROM reservas WHERE id = :id'
    );

    $consulta->execute([
        ':id' => $id
    ]);

    if ($consulta->rowCount() === 0) {
        responder(404, [
            'error' => 'Reserva no encontrada'
        ]);
    }

    responder(200, [
        'mensaje' => 'Reserva cancelada correctamente'
    ]);
}

// Ruta no encontrada
responder(404, [
    'error' => 'Ruta no encontrada'
]);

?>