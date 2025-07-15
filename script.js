document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('materias.json');
  const materias = await response.json();

  const container = document.getElementById('malla-container');
  const progresoTexto = document.getElementById('progreso-texto');
  const progresoInterno = document.getElementById('progreso-interno');

  const estados = JSON.parse(localStorage.getItem('estadosMaterias')) || {};

  function actualizarProgreso() {
    const total = Object.keys(materias).length;
    const completadas = Object.values(estados).filter(e => e === 2).length;
    const porcentaje = Math.round((completadas / total) * 100);
    progresoTexto.textContent = `${porcentaje}% completado`;
    progresoInterno.style.width = `${porcentaje}%`;
  }

  function crearMateria(nombre, tipo) {
    const div = document.createElement('div');
    div.className = `materia ${tipo}`;
    div.textContent = nombre;
    div.dataset.nombre = nombre;
    div.dataset.tipo = tipo;
    div.dataset.estado = estados[nombre] || 0;
    aplicarEstadoVisual(div);

    div.addEventListener('click', () => {
      const estado = parseInt(div.dataset.estado);
      const nuevoEstado = (estado + 1) % 3;
      div.dataset.estado = nuevoEstado;
      estados[nombre] = nuevoEstado;
      aplicarEstadoVisual(div);
      guardarEstados();
      desbloquearMaterias();
      actualizarProgreso();
    });

    return div;
  }

  function aplicarEstadoVisual(div) {
    div.classList.remove('bloqueada', 'cursada', 'aprobada');
    const estado = parseInt(div.dataset.estado);
    const tipo = div.dataset.tipo;
    const nombre = div.dataset.nombre;

    if (estado === 1) {
      div.classList.add('cursada');
      div.textContent = `⏺️ ${nombre}`;
    } else if (estado === 2) {
      div.classList.add('aprobada');
      div.textContent = `✅ ${nombre}`;
    } else {
      div.textContent = nombre;
    }
  }

  function guardarEstados() {
    localStorage.setItem('estadosMaterias', JSON.stringify(estados));
  }

  function desbloquearMaterias() {
    document.querySelectorAll('.materia').forEach(div => {
      const nombre = div.dataset.nombre;
      const requisitos = materias[nombre];
      const requiereRegular = requisitos.requiereRegular || [];
      const requiereAprobada = requisitos.requiereAprobada || [];

      const cumpleRegular = requiereRegular.every(req => estados[req] >= 1);
      const cumpleAprobada = requiereAprobada.every(req => estados[req] === 2);

      if (cumpleRegular && cumpleAprobada) {
        div.classList.remove('bloqueada');
        div.style.pointerEvents = 'auto';
      } else {
        div.classList.add('bloqueada');
        div.style.pointerEvents = 'none';
      }
    });
  }

  // Renderización
  for (const cuatri in materias) {
    const divCuatri = document.createElement('div');
    divCuatri.className = 'cuatrimestre';
    const h2 = document.createElement('h2');
    h2.textContent = cuatri;
    divCuatri.appendChild(h2);

    for (const nombre in materias[cuatri]) {
      const data = materias[cuatri][nombre];
      const materiaDiv = crearMateria(nombre, data.tipo);
      divCuatri.appendChild(materiaDiv);
    }

    container.appendChild(divCuatri);
  }

  desbloquearMaterias();
  actualizarProgreso();

  // Botón de reset (opcional)
  const botonReset = document.createElement('button');
  botonReset.textContent = 'Reiniciar progreso';
  botonReset.addEventListener('click', () => {
    localStorage.removeItem('estadosMaterias');
    location.reload();
  });
  document.body.appendChild(botonReset);
});
