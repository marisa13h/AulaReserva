// Dirección del backend PHP
const API = "/api";

const configuracion = window.APP_CONFIG || {
    nombre: "AulaReserva",
    entorno: "development"
};

// Elementos HTML
const contenedor = document.getElementById("lista-aulas");
const selectorAula = document.getElementById("aula");
const formulario = document.getElementById("formulario-reserva");
const mensaje = document.getElementById("mensaje");
const listaReservas = document.getElementById("lista-reservas");
const contador = document.getElementById("contador-reservas");

// Mostrar nombre y entorno
document.getElementById("nombre-app").textContent = configuracion.nombre;

document.getElementById("entorno-app").textContent =
    configuracion.entorno === "production"
        ? "Producción"
        : "Desarrollo";

// ==========================================
// 1. CARGAR AULAS
// ==========================================

async function cargarAulas() {
    try {
        const respuesta = await fetch(`${API}/aulas`);

        if (!respuesta.ok) {
            throw new Error("Error al obtener las aulas");
        }

        const aulas = await respuesta.json();

        contenedor.innerHTML = "";
        selectorAula.innerHTML =
            '<option value="">Selecciona un aula</option>';

        aulas.forEach(aula => {

            const tarjeta = document.createElement("article");
            tarjeta.classList.add("tarjeta");

            const nombre = document.createElement("h3");
            nombre.textContent = aula.nombre;

            const capacidad = document.createElement("p");
            capacidad.textContent =
                `Capacidad: ${aula.capacidad} personas`;

            tarjeta.append(nombre, capacidad);
            contenedor.appendChild(tarjeta);

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

formulario.addEventListener("submit", async event => {

    event.preventDefault();

    const reserva = {
        aula: selectorAula.value,
        fecha: document.getElementById("fecha").value,
        hora: document.getElementById("hora").value,
        responsable: document.getElementById("responsable").value.trim()
    };

    if (
        !reserva.aula ||
        !reserva.fecha ||
        !reserva.hora ||
        !reserva.responsable
    ) {
        mostrarMensaje("Completa todos los campos.", "error");
        return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaReserva = new Date(reserva.fecha + "T00:00:00");

    if (fechaReserva < hoy) {
        mostrarMensaje("No puedes seleccionar una fecha pasada.", "error");
        return;
    }

    try {

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

        mostrarMensaje(resultado.mensaje, "exito");

        formulario.reset();

        await cargarReservas();

    } catch (error) {

        mostrarMensaje(error.message, "error");
        console.error(error);

    }
});

// ==========================================
// 3. CONSULTAR RESERVAS
// ==========================================

async function cargarReservas() {

    try {

        const respuesta = await fetch(`${API}/reservas`);

        if (!respuesta.ok) {
            throw new Error("Error al consultar las reservas");
        }

        const reservas = await respuesta.json();

        listaReservas.innerHTML = "";

        // Actualizar contador
        contador.textContent = reservas.length;

        if (reservas.length === 0) {

            const fila = document.createElement("tr");
            const celda = document.createElement("td");

            celda.colSpan = 5;
            celda.textContent = "Todavía no hay reservas registradas.";

            fila.appendChild(celda);
            listaReservas.appendChild(fila);

            return;
        }

        reservas.forEach(reserva => {

            const fila = document.createElement("tr");

            const datos = [
                reserva.aula,
                reserva.fecha,
                reserva.hora,
                reserva.responsable
            ];

            datos.forEach(valor => {

                const celda = document.createElement("td");
                celda.textContent = valor;

                fila.appendChild(celda);

            });

            const celdaAcciones = document.createElement("td");

            const botonCancelar = document.createElement("button");

            botonCancelar.textContent = "Cancelar";
            botonCancelar.classList.add("boton-cancelar");

            botonCancelar.addEventListener("click", () => {
                cancelarReserva(reserva.id);
            });

            celdaAcciones.appendChild(botonCancelar);
            fila.appendChild(celdaAcciones);

            listaReservas.appendChild(fila);

        });

    } catch (error) {

        listaReservas.innerHTML = "";

        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 5;
        celda.textContent = "No se pudieron cargar las reservas.";

        fila.appendChild(celda);
        listaReservas.appendChild(fila);

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

        mostrarMensaje(resultado.mensaje, "exito");

        await cargarReservas();

    } catch (error) {

        mostrarMensaje(error.message, "error");
        console.error(error);

    }
}

// ==========================================
// 5. MOSTRAR MENSAJES
// ==========================================

function mostrarMensaje(texto, tipo) {

    mensaje.textContent = texto;

    mensaje.className = tipo;

}

// ==========================================
// 6. INICIAR AULARESERVA
// ==========================================

cargarAulas();
cargarReservas();