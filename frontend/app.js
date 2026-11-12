const contenedor = document.getElementById("lista-aulas");

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

            const tarjeta = document.createElement("article");

            tarjeta.classList.add("tarjeta");

            const nombre = document.createElement("h3");
            nombre.textContent = aula.nombre;

            const capacidad = document.createElement("p");
            capacidad.textContent = "Capacidad: " + aula.capacidad + " personas";

            tarjeta.appendChild(nombre);
            tarjeta.appendChild(capacidad);

            contenedor.appendChild(tarjeta);
        });

    })
    .catch(error => {
        contenedor.textContent = "No se pudieron cargar las aulas.";
        console.error(error);
    });