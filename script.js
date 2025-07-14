let materias;
let aprobadas = JSON.parse(localStorage.getItem("materiasAprobadas") || "[]");

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
      const m = document.createElement("div");
      m.classList.add("materia");

      // ⭐ Si es promocional, se aplica clase especial
      if (mat.promocional) {
        m.classList.add("promocional");
      }

      m.textContent = mat.nombre;

      // ✅ Si está aprobada
      if (aprobadas.includes(mat.id)) {
        m.classList.add("aprobada");
      }
      // 🔒 Si está bloqueada por correlativas
      else if (!mat.correlativas.every(req => aprobadas.includes(req))) {
        m.classList.add("bloqueada");
      }

      // Acciones al tocar
      m.onclick = () => toggleMateria(mat.id);

      div.appendChild(m);
    });

    container.appendChild(div);
  });

  actualizarBarraProgreso(); // 🔄 Actualiza el progreso visual
}

function toggleMateria(id) {
  if (aprobadas.includes(id)) {
    aprobadas = aprobadas.filter(m => m !== id);
  } else {
    aprobadas.push(id);
  }
  localStorage.setItem("materiasAprobadas", JSON.stringify(aprobadas));
  renderMalla();
  actualizarBarraProgreso();
}

function resetearProgreso() {
  if (confirm("¿Seguro que querés borrar tu progreso?")) {
    aprobadas = [];
    localStorage.removeItem("materiasAprobadas");
    renderMalla();
    actualizarBarraProgreso();
  }
}

function actualizarBarraProgreso() {
  const totalMaterias = materias.flatMap(c => c.materias).length;
  const porcentaje = Math.round((aprobadas.length / totalMaterias) * 100);
  const barra = document.getElementById("progreso-interno");
  const texto = document.getElementById("progreso-texto");

  barra.style.width = `${porcentaje}%`;
  texto.textContent = `${porcentaje}% completado`;
}

cargarMaterias();
