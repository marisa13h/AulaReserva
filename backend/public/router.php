<?php

$ruta = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// La raíz del proyecto AulaReserva
$raiz = dirname(__DIR__, 2);

// Archivos del frontend
$archivos = [
    '/' => $raiz . '/frontend/index.html',
    '/assets/styles.css' => $raiz . '/frontend/styles.css',
    '/assets/app.js' => $raiz . '/frontend/app.js',
    '/assets/config.js' => $raiz . '/frontend/config.js'
];

// Servir archivos estáticos
if (isset($archivos[$ruta])) {

    if (!is_file($archivos[$ruta])) {
        http_response_code(404);
        echo 'Archivo no encontrado: ' . $ruta;
        exit;
    }

    $tipos = [
        '.html' => 'text/html; charset=utf-8',
        '.css' => 'text/css; charset=utf-8',
        '.js' => 'application/javascript; charset=utf-8'
    ];

    $extension = '.' . pathinfo(
        $archivos[$ruta],
        PATHINFO_EXTENSION
    );

    header('Content-Type: ' . $tipos[$extension]);

    readfile($archivos[$ruta]);
    exit;
}

// Enviar las peticiones API al controlador
if (str_starts_with($ruta, '/api/')) {

    require __DIR__ . '/index.php';
    exit;
}

// Ruta no encontrada
http_response_code(404);
echo 'Página no encontrada';

