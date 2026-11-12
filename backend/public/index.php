<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$aulas = [
    [
        "id" => 1,
        "nombre" => "Aula de Informática 1",
        "capacidad" => 30
    ],
    [
        "id" => 2,
        "nombre" => "Aula de Informática 2",
        "capacidad" => 25
    ],
    [
        "id" => 3,
        "nombre" => "Aula de Formación",
        "capacidad" => 20
    ]
];

echo json_encode($aulas, JSON_UNESCAPED_UNICODE);

?>
