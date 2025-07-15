const contenedor = document.getElementById("contenedor");
const progreso = document.getElementById("progreso");
let materias = {};

fetch("materias.json")
  .then((response) => response.json())
  .then((data) => {
    materias = data;
    renderizarMalla();
  });

function renderizarMalla() {
  contenedor.innerHTML = "";

  Object.entries(materias).forEach(([cuatrimestre, lista]) => {
    const columna = document.createElement("div");
    columna.className = "columna";

    const titulo = document.createElement("h3");
    titulo.textContent = cuatrimestre;
    columna.appendChild(titulo);

    lista.forEach((materia) => {
      const boton = document.createElement("button");
      boton.className = "materia";
      boton.textContent = materia.nombre;
      boton.dataset.codigo = materia.codigo;
      boton.dataset.estado = "pendiente";

      if (materia.promocional) {
        boton.classList.add("promocional");
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

  if (estado === "pendiente") {
    boton.dataset.estado = "cursada";
    boton.innerHTML = `⏺️ ${materia.nombre}`;
  } else if (estado === "cursada") {
    boton.dataset.estado = "aprobada";
    boton.innerHTML = `✅ ${materia.nombre}`;
  } else {
    boton.dataset.estado = "pendiente";
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
      boton.dataset.estado = estado;

      if (estado === "cursada") {
        boton.innerHTML = `⏺️ ${boton.textContent}`;
      } else if (estado === "aprobada") {
        boton.innerHTML = `✅ ${boton.textContent.replace("⏺️ ", "")}`;
      }
    }
  });
}

function actualizarProgreso() {
  const botones = document.querySelectorAll(".materia");
  const total = botones.length;
  const aprobadas = Array.from(botones).filter(b => b.dataset.estado === "aprobada").length;
  const porcentaje = Math.round((aprobadas / total) * 100);
  progreso.style.width = `${porcentaje}%`;
  progreso.textContent = `${porcentaje}% completado`;
}

function manejarCorrelativas() {
  const estados = JSON.parse(localStorage.getItem("estados")) || {};
  document.querySelectorAll(".materia").forEach((boton) => {
    boton.disabled = false;
    boton.classList.remove("bloqueada");
  });

  Object.values(materias).flat().forEach((materia) => {
    const boton = document.querySelector(`.materia[data-codigo='${materia.codigo}']`);

    if (materia.correlativas) {
      const { regular = [], aprobado = [] } = materia.correlativas;

      const faltanRegular = regular.some((cod) => estados[cod] !== "cursada" && estados[cod] !== "aprobada");
      const faltanAprobado = aprobado.some((cod) => estados[cod] !== "aprobada");

      if (faltanRegular || faltanAprobado) {
        boton.disabled = true;
        boton.classList.add("bloqueada");
      }
    }
  });
}
