
// Dirección del backend PHP
const API = "http://localhost:8000/api";

// Elementos del HTML
const contenedor = document.getElementById("lista-aulas");
const selectorAula = document.getElementById("aula");
const formulario = document.getElementById("formulario-reserva");
const mensaje = document.getElementById("mensaje");
const listaReservas = document.getElementById("lista-reservas");


// ==========================================
// 1. CARGAR LAS AULAS DESDE SQLITE
// ==========================================

async function cargarAulas() {

    try {

        const respuesta = await fetch(`${API}/aulas`);

        if (!respuesta.ok) {
            throw new Error("Error al obtener las aulas");
        }

        const aulas = await respuesta.json();

        contenedor.innerHTML = "";
        selectorAula.innerHTML = '<option value="">Selecciona un aula</option>';

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

    } catch (error) {

        contenedor.textContent = "No se pudieron cargar las aulas.";
        console.error(error);

    }
}


// ==========================================
// 2. CREAR UNA RESERVA
// ==========================================

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

        // Enviar reserva a PHP
        const respuesta = await fetch(`${API}/reservas`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(reserva)

        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.error || "No se pudo crear la reserva"
            );
        }

        // Mostrar confirmación
        mensaje.textContent = resultado.mensaje;
        mensaje.style.color = "green";

        // Limpiar formulario
        formulario.reset();

        // Actualizar las reservas desde SQLite
        await cargarReservas();

        console.log("Reserva guardada:", resultado.reserva);

    } catch (error) {

        mensaje.textContent = error.message;
        mensaje.style.color = "red";

        console.error(error);

    }

});


// ==========================================
// 3. CONSULTAR LAS RESERVAS DE SQLITE
// ==========================================

async function cargarReservas() {

    try {

        const respuesta = await fetch(`${API}/reservas`);

        if (!respuesta.ok) {
            throw new Error("Error al consultar las reservas");
        }

        const reservas = await respuesta.json();

        listaReservas.innerHTML = "";

        if (reservas.length === 0) {

            listaReservas.textContent = "Todavía no hay reservas registradas.";
            return;

        }

        reservas.forEach(reserva => {

            // Crear tarjeta de reserva
            const tarjeta = document.createElement("article");
            tarjeta.classList.add("tarjeta");

            const titulo = document.createElement("h3");
            titulo.textContent = reserva.aula;

            const fecha = document.createElement("p");
            fecha.textContent = "Fecha: " + reserva.fecha;

            const hora = document.createElement("p");
            hora.textContent = "Hora: " + reserva.hora;

            const responsable = document.createElement("p");
            responsable.textContent =
                "Responsable: " + reserva.responsable;

            const botonCancelar = document.createElement("button");
            botonCancelar.textContent = "Cancelar reserva";

            botonCancelar.addEventListener("click", function() {
                cancelarReserva(reserva.id);
            });

            tarjeta.appendChild(titulo);
            tarjeta.appendChild(fecha);
            tarjeta.appendChild(hora);
            tarjeta.appendChild(responsable);
            tarjeta.appendChild(botonCancelar);

            listaReservas.appendChild(tarjeta);

        });

    } catch (error) {

        listaReservas.textContent = "No se pudieron cargar las reservas.";
        console.error(error);

    }

}


// ==========================================
// 4. CANCELAR UNA RESERVA
// ==========================================

async function cancelarReserva(id) {

    const confirmar = confirm(
        "¿Seguro que quieres cancelar esta reserva?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta = await fetch(`${API}/reservas/${id}`, {

            method: "DELETE"

        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.error || "No se pudo cancelar la reserva"
            );
        }

        mensaje.textContent = resultado.mensaje;
        mensaje.style.color = "green";

        // Actualizar listado
        await cargarReservas();

    } catch (error) {

        mensaje.textContent = error.message;
        mensaje.style.color = "red";

        console.error(error);

    }

}


// ==========================================
// 5. INICIAR LA APLICACIÓN
// ==========================================

cargarAulas();
cargarReservas();