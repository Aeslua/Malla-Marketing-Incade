let materias = [];
let estadoMaterias = {};
let materiasBloqueadas = {};
let totalMaterias = 0;

async function cargarMaterias() {
  const response = await fetch('materias.json');
  materias = await response.json();
  totalMaterias = materias.length;

  materias.forEach((materia, index) => {
    const card = document.createElement('div');
    card.className = 'materia-card';
    card.textContent = materia.nombre;

    // Color base
    card.classList.add(materia.promocional ? 'promocional' : 'regular');

    // Estado inicial
    estadoMaterias[materia.nombre] = 'inicial';
    materiasBloqueadas[materia.nombre] = verificarBloqueada(materia);

    if (materiasBloqueadas[materia.nombre]) {
      card.classList.add('bloqueada');
    }

    card.addEventListener('click', () => {
      if (materiasBloqueadas[materia.nombre]) return;

      // Estado: inicial → cursada → aprobada → inicial
      const estado = estadoMaterias[materia.nombre];
      if (estado === 'inicial') {
        estadoMaterias[materia.nombre] = 'cursada';
        card.classList.add('cursada');
        card.innerHTML = '⏺️ ' + materia.nombre;
      } else if (estado === 'cursada') {
        estadoMaterias[materia.nombre] = 'aprobada';
        card.classList.remove('cursada');
        card.classList.add('aprobada');
        card.innerHTML = '✅ ' + materia.nombre;
      } else {
        estadoMaterias[materia.nombre] = 'inicial';
        card.classList.remove('cursada', 'aprobada');
        card.innerHTML = materia.nombre;
      }

      actualizarDesbloqueos();
      actualizarProgreso();
    });

    const container = document.getElementById(`cuatrimestre-${materia.cuatrimestre}`);
    container.appendChild(card);
  });

  actualizarProgreso();
}

function verificarBloqueada(materia) {
  if (!materia.correlativas) return false;

  const { cursadas, aprobadas } = materia.correlativas;
  const todasCursadas = cursadas?.every(
    nombre => estadoMaterias[nombre] === 'cursada' || estadoMaterias[nombre] === 'aprobada'
  );
  const todasAprobadas = aprobadas?.every(
    nombre => estadoMaterias[nombre] === 'aprobada'
  );

  return !(todasCursadas ?? true) || !(todasAprobadas ?? true);
}

function actualizarDesbloqueos() {
  materias.forEach(materia => {
    const card = [...document.querySelectorAll('.materia-card')]
      .find(el => el.textContent.includes(materia.nombre));

    const bloqueadaAntes = materiasBloqueadas[materia.nombre];
    materiasBloqueadas[materia.nombre] = verificarBloqueada(materia);

    if (materiasBloqueadas[materia.nombre]) {
      card.classList.add('bloqueada');
    } else {
      card.classList.remove('bloqueada');
    }
  });
}

function actualizarProgreso() {
  const aprobadas = Object.values(estadoMaterias).filter(estado => estado === 'aprobada').length;
  const porcentaje = Math.round((aprobadas / totalMaterias) * 100);
  document.getElementById('progreso-barra').style.width = `${porcentaje}%`;
  document.getElementById('progreso-texto').textContent = `${porcentaje}% completado`;
}

function resetearProgreso() {
  estadoMaterias = {};
  document.querySelectorAll('.materia-card').forEach(card => {
    card.classList.remove('cursada', 'aprobada', 'bloqueada');
    const nombre = card.textContent.replace('⏺️ ', '').replace('✅ ', '');
    const materia = materias.find(m => m.nombre === nombre);
    card.textContent = materia.nombre;
    card.classList.add(materia.promocional ? 'promocional' : 'regular');
    estadoMaterias[nombre] = 'inicial';
  });
  actualizarDesbloqueos();
  actualizarProgreso();
}

document.getElementById('resetear').addEventListener('click', resetearProgreso);

cargarMaterias();
