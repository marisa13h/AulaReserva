
<?php

// Obtener la ruta principal del proyecto
$raiz = dirname(__DIR__, 2);

// Obtener la ruta de la base de datos
$rutaBD = getenv('DB_PATH') ?: 'data/aulareserva.sqlite';

// Si la ruta es relativa, situarla dentro del proyecto
if (!str_starts_with($rutaBD, DIRECTORY_SEPARATOR)) {
    $rutaBD = $raiz . DIRECTORY_SEPARATOR . $rutaBD;
}

// Crear la carpeta data si no existe
$directorio = dirname($rutaBD);

if (!is_dir($directorio)) {
    mkdir($directorio, 0775, true);
}

// Comprobar que PHP tiene PDO SQLite
if (!in_array('sqlite', PDO::getAvailableDrivers(), true)) {
    throw new RuntimeException(
        'La extensión pdo_sqlite no está instalada.'
    );
}

// Comprobar si la base de datos ya existía
$baseExistia = file_exists($rutaBD);

// Crear la conexión
$pdo = new PDO('sqlite:' . $rutaBD);

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

// Activar las claves externas
$pdo->exec('PRAGMA foreign_keys = ON');

// Inicializar el esquema solamente si la BD no existía
if (!$baseExistia) {
    $esquema = $raiz . '/database/schema.sql';

    if (!file_exists($esquema)) {
        throw new RuntimeException('No se encuentra database/schema.sql');
    }

    $sql = file_get_contents($esquema);
    $pdo->exec($sql);
}

return $pdo;

?>
