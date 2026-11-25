CREATE TABLE IF NOT EXISTS aulas (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    capacidad INTEGER NOT NULL CHECK(capacidad > 0),
    ubicacion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aula_id INTEGER NOT NULL REFERENCES aulas(id),
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    responsable TEXT NOT NULL,
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aula_id, fecha, hora)
);

INSERT OR IGNORE INTO aulas (id, nombre, capacidad, ubicacion) VALUES
    (1, 'Informática 1', 30, 'Planta baja'),
    (2, 'Informática 2', 25, 'Primera planta'),
    (3, 'Aula multimedia', 20, 'Primera planta');