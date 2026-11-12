const contenedor = document.getElementById("lista-aulas");
const selectorAula = document.getElementById("aula");
const formulario = document.getElementById("formulario-reserva");
const mensaje = document.getElementById("mensaje");

// 1. Obtener las aulas desde PHP
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

            // Crear tarjeta del aula
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


// 2. Enviar una reserva al backend
formulario.addEventListener("submit", async function(event) {

    event.preventDefault();

    const reserva = {
        aula: selectorAula.value,
        fecha: document.getElementById("fecha").value,
        hora: document.getElementById("hora").value,
        responsable: document.getElementById("responsable").value.trim()
    };

    // Comprobar campos obligatorios
    if (
        !reserva.aula ||
        !reserva.fecha ||
        !reserva.hora ||
        !reserva.responsable
    ) {
        mensaje.textContent = "Debes completar todos los campos.";
        mensaje.style.color = "red";
        return;
    }

    // Comprobar que la fecha no sea pasada
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaReserva = new Date(reserva.fecha + "T00:00:00");

    if (fechaReserva < hoy) {
        mensaje.textContent = "No puedes seleccionar una fecha pasada.";
        mensaje.style.color = "red";
        return;
    }

    try {

        // Enviar los datos a PHP
        const respuesta = await fetch(
            "http://localhost:8000/reservas.php",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(reserva)
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.error || "No se pudo procesar la reserva"
            );
        }

        // Mostrar respuesta del backend
        mensaje.textContent = resultado.mensaje;
        mensaje.style.color = "green";

        // Limpiar formulario
        formulario.reset();

        console.log("Reserva recibida:", resultado.reserva);

    } catch (error) {

        mensaje.textContent = error.message;
        mensaje.style.color = "red";

        console.error(error);
    }

});