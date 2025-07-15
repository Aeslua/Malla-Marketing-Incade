const contenedor = document.getElementById("malla-container");
const progreso = document.getElementById("progreso-interno");
const progresoTexto = document.getElementById("progreso-texto");
let materias = {};

fetch("materias.json")
  .then((response) => response.json())
  .then((data) => {
    materias = data;
    renderizarMalla();
  })
  .catch((err) => console.error("Error cargando materias.json:", err));

function renderizarMalla() {
  contenedor.innerHTML = "";

  Object.entries(materias).forEach(([cuatrimestre, lista]) => {
    const columna = document.createElement("div");
    columna.className = "cuatrimestre";

    const titulo = document.createElement("h2");
    titulo.textContent = cuatrimestre;
    columna.appendChild(titulo);

    lista.forEach((materia) => {
      const boton = document.createElement("button");
      boton.className = "materia";
      boton.textContent = materia.nombre;
      boton.dataset.codigo = materia.codigo;
      boton.dataset.estado = "pendiente";
      boton.dataset.nombre = materia.nombre;

      // Asignar clase según sea promocional o regular
      if (materia.promocional) {
        boton.classList.add("promocional");
      } else {
        boton.classList.add("regular");
      }

      boton.addEventListener("click", () => cambiarEstado(boton, materia));
      columna.appendChild(boton);
    });

    contenedor.appendChild(columna);
  });

  actualizarEstadosGuardados();
  actualizarProgreso();
  manejarCorrelativas();
}

function cambiarEstado(boton, materia) {
  const estado = boton.dataset.estado;

  // Remover todas las clases de estado antes de asignar la nueva
  boton.classList.remove("regular", "promocional", "cursada", "aprobada");

  if (estado === "pendiente") {
    boton.dataset.estado = "cursada";
    boton.classList.add("cursada");
    boton.innerHTML = `⏺️ ${materia.nombre}`;
  } else if (estado === "cursada") {
    boton.dataset.estado = "aprobada";
    boton.classList.add("aprobada");
    boton.innerHTML = `✅ ${materia.nombre}`;
  } else {
    boton.dataset.estado = "pendiente";
    if (materia.promocional) {
      boton.classList.add("promocional");
    } else {
      boton.classList.add("regular");
    }
    boton.innerHTML = materia.nombre;
  }

  guardarEstado(boton.dataset.codigo, boton.dataset.estado);
  actualizarProgreso();
  manejarCorrelativas();
}

function guardarEstado(codigo, estado) {
  let estados = JSON.parse(localStorage.getItem("estados")) || {};
  estados[codigo] = estado;
  localStorage.setItem("estados", JSON.stringify(estados));
}

function actualizarEstadosGuardados() {
  const estados = JSON.parse(localStorage.getItem("estados")) || {};
  document.querySelectorAll(".materia").forEach((boton) => {
    const estado = estados[boton.dataset.codigo];
    if (estado) {
      // Remover todas las clases de estado antes de asignar la guardada
      boton.classList.remove("regular", "promocional", "cursada", "aprobada");

      boton.dataset.estado = estado;

      if (estado === "cursada") {
        boton.classList.add("cursada");
        boton.innerHTML = `⏺️ ${boton.dataset.nombre}`;
      } else if (estado === "aprobada") {
        boton.classList.add("aprobada");
        boton.innerHTML = `✅ ${boton.dataset.nombre}`;
      } else {
        if (boton.classList.contains("promocional") || boton.dataset.promocional === "true") {
          boton.classList.add("promocional");
        } else {
          boton.classList.add("regular");
        }
        boton.innerHTML = boton.dataset.nombre;
      }
    }
  });
}

function actualizarProgreso() {
  const botones = document.querySelectorAll(".materia");
  const total = botones.length;
  const aprobadas = Array.from(botones).filter(
    (b) => b.dataset.estado === "aprobada"
  ).length;
  const porcentaje = Math.round((aprobadas / total) * 100);
  progreso.style.width = `${porcentaje}%`;
  progresoTexto.textContent = `${porcentaje}% completado`;
}

function manejarCorrelativas() {
  const estados = JSON.parse(localStorage.getItem("estados")) || {};
  document.querySelectorAll(".materia").forEach((boton) => {
    boton.disabled = false;
    boton.classList.remove("bloqueada");
  });

  Object.values(materias)
    .flat()
    .forEach((materia) => {
      const boton = document.querySelector(`.materia[data-codigo='${materia.codigo}']`);

      if (materia.correlativas) {
        const { regular = [], aprobado = [] } = materia.correlativas;

        const faltanRegular = regular.some(
          (cod) => estados[cod] !== "cursada" && estados[cod] !== "aprobada"
        );
        const faltanAprobado = aprobado.some((cod) => estados[cod] !== "aprobada");

        if (faltanRegular || faltanAprobado) {
          boton.disabled = true;
          boton.classList.add("bloqueada");
        }
      }
    });
}
