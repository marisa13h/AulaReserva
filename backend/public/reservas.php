
<?php

header('Content-Type: application/json; charset=utf-8');

// Configuración CORS
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Permitir la petición previa CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        "error" => "Método no permitido"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

// Leer los datos JSON recibidos
$datos = json_decode(file_get_contents('php://input'), true);

// Comprobar que los datos son correctos
if (
    !is_array($datos) ||
    empty($datos['aula']) ||
    empty($datos['fecha']) ||
    empty($datos['hora']) ||
    empty(trim($datos['responsable'] ?? ''))
) {
    http_response_code(400);

    echo json_encode([
        "error" => "Faltan datos obligatorios para la reserva"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

// Preparar la respuesta correcta
http_response_code(201)

echo json_encode([
    "mensaje" => "Reserva recibida correctamente",
    "reserva" => [
        "aula" => $datos['aula'],
        "fecha" => $datos['fecha'],
        "hora" => $datos['hora'],
        "responsable" => trim($datos['responsable'])
    ]
], JSON_UNESCAPED_UNICODE);

?>
