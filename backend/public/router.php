<?php

// Obtener la ruta solicitada
$ruta = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Las rutas de la API se procesan desde index.php
if (str_starts_with($ruta, '/api/')) {
    require __DIR__ . '/index.php';
    exit;
}

// Permitir servir archivos existentes
$archivo = __DIR__ . $ruta;

if ($ruta !== '/' && is_file($archivo)) {
    return false;
}

// Cualquier otra ruta pasa al controlador principal
require __DIR__ . '/index.php';

?>