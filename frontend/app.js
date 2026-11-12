const contenedor = document.getElementById("lista-aulas");
const selectorAula = document.getElementById("aula");
const formulario = document.getElementById("formulario-reserva");
const mensaje = document.getElementById("mensaje");

// Obtener las aulas desde PHP
fetch("http://localhost:8000")
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al obtener las aulas");
        }

        return response.json();
    })
    .then(aulas => {

        contenedor.innerHTML = "";

        aulas.forEach(aula => {

            // Crear tarjeta
            const tarjeta = document.createElement("article");
            tarjeta.classList.add("tarjeta");

            const nombre = document.createElement("h3");
            nombre.textContent = aula.nombre;

            const capacidad = document.createElement("p");
            capacidad.textContent =
                "Capacidad: " + aula.capacidad + " personas";

            tarjeta.appendChild(nombre);
            tarjeta.appendChild(capacidad);

            contenedor.appendChild(tarjeta);

            // Añadir aula al selector
            const opcion = document.createElement("option");

            opcion.value = aula.id;
            opcion.textContent = aula.nombre;

            selectorAula.appendChild(opcion);
        });

    })
    .catch(error => {
        contenedor.textContent = "No se pudieron cargar las aulas.";
        console.error(error);
    });


// Validar el formulario
formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const aula = selectorAula.value;
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const responsable =
        document.getElementById("responsable").value.trim();

    // Comprobar campos obligatorios
    if (!aula || !fecha || !hora || !responsable) {

        mensaje.textContent = "Debes completar todos los campos.";
        mensaje.style.color = "red";

        return;
    }

    // Comprobar que la fecha no sea anterior a hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaReserva = new Date(fecha + "T00:00:00");

    if (fechaReserva < hoy) {

        mensaje.textContent = "No puedes seleccionar una fecha pasada.";
        mensaje.style.color = "red";

        return;
    }

    // Mostrar confirmación
    mensaje.textContent =
        "Solicitud de reserva preparada correctamente.";

    mensaje.style.color = "green";

    console.log({
        aula,
        fecha,
        hora,
        responsable
    });

});