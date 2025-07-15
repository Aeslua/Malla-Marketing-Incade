let materias;
let estadoMaterias = JSON.parse(localStorage.getItem("estadoMaterias") || "{}");

async function cargarMaterias() {
  const res = await fetch("materias.json");
  materias = await res.json();
  renderMalla();
  actualizarBarraProgreso();
}

function renderMalla() {
  const container = document.getElementById("malla-container");
  container.innerHTML = "";

  materias.forEach(cuatri => {
    const div = document.createElement("div");
    div.classList.add("cuatrimestre");
    div.innerHTML = `<h2>${cuatri.cuatrimestre}</h2>`;

    cuatri.materias.forEach(mat => {
      const estado = estadoMaterias[mat.id] || "ninguno";
      const m = document.createElement("div");
      m.classList.add("materia");

      // Conserva color base para promocionales
      if (mat.promocional) {
        m.classList.add("promocional");
      }

      // Aplica clase según estado para regulares
      if (!mat.promocional) {
        if (estado === "cursada") m.classList.add("cursada");
        else if (estado === "aprobada") m.classList.add("aprobada");
      }

      // Si no tiene correlativas aprobadas y no tiene estado, bloquear
      if (
        estado === "ninguno" &&
        !mat.correlativas.every(req => estadoMaterias[req] === "aprobada")
      ) {
        m.classList.add("bloqueada");
      }

      // Íconos según estado
      let icono = "";
      if (estado === "cursada") icono = " ⏺️";
      else if (estado === "aprobada") icono = " ✅";

      m.textContent = mat.nombre + icono;

      m.onclick = () => cambiarEstado(mat.id, mat.correlativas, mat.promocional);
      div.appendChild(m);
    });

    container.appendChild(div);
  });

  actualizarBarraProgreso();
}

function cambiarEstado(id, correlativas, esPromocional) {
  let estado = estadoMaterias[id] || "ninguno";

  if (estado === "ninguno") {
    // Verifica correlativas
    const puedeCursar = correlativas.every(req => estadoMaterias[req] === "aprobada");
    if (!puedeCursar) return;
    estadoMaterias[id] = "cursada";
  } else if (estado === "cursada") {
    estadoMaterias[id] = "aprobada";
  } else {
    delete estadoMaterias[id]; // vuelve a estado inicial
  }

  localStorage.setItem("estadoMaterias", JSON.stringify(estadoMaterias));
  renderMalla();
}

function resetearProgreso() {
  if (confirm("¿Seguro que querés borrar tu progreso?")) {
    estadoMaterias = {};
    localStorage.removeItem("estadoMaterias");
    renderMalla();
  }
}

function actualizarBarraProgreso() {
  const total = materias.flatMap(c => c.materias).length;
  const completadas = Object.values(estadoMaterias).filter(e => e === "aprobada").length;
  const porcentaje = Math.round((completadas / total) * 100);
  const barra = document.getElementById("progreso-interno");
  const texto = document.getElementById("progreso-texto");

  barra.style.width = `${porcentaje}%`;
  texto.textContent = `${porcentaje}% completado`;
}

cargarMaterias();
