let materias;
let aprobadas = JSON.parse(localStorage.getItem("materiasAprobadas") || "[]");

async function cargarMaterias() {
  const res = await fetch("materias.json");
  materias = await res.json();
  renderMalla();
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
      m.textContent = mat.nombre;

      if (aprobadas.includes(mat.id)) {
        m.classList.add("aprobada");
      } else if (!mat.correlativas.every(req => aprobadas.includes(req))) {
        m.classList.add("bloqueada");
      }

      m.onclick = () => toggleMateria(mat.id);
      div.appendChild(m);
    });

    container.appendChild(div);
  });
}

function toggleMateria(id) {
  if (aprobadas.includes(id)) {
    aprobadas = aprobadas.filter(m => m !== id);
  } else {
    aprobadas.push(id);
  }
  localStorage.setItem("materiasAprobadas", JSON.stringify(aprobadas));
  renderMalla();
}

function resetearProgreso() {
  if (confirm("¿Seguro que querés borrar tu progreso?")) {
    aprobadas = [];
    localStorage.removeItem("materiasAprobadas");
    renderMalla();
  }
}

cargarMaterias();
