const formulario = document.getElementById('formulario');
const nombre = document.getElementById('nombre');
const correo = document.getElementById('correo');
const edad = document.getElementById('edad');
const resultado = document.getElementById('resultado');

formulario.addEventListener('submit', function (e) {
  e.preventDefault();

  edad.setCustomValidity('');

  if (edad.value <= 18) {
    edad.setCustomValidity('Debes tener más de 18 años.');
  }

  if (formulario.checkValidity()) {
    const datos = {
      nombre: nombre.value,
      correo: correo.value,
      edad: edad.value
    };
    localStorage.setItem('datosUsuario', JSON.stringify(datos));
    alert('Datos guardados exitosamente');
    formulario.reset();
  } else {
    formulario.reportValidity();
  }
});

document.getElementById('mostrar').addEventListener('click', function () {
  const datos = JSON.parse(localStorage.getItem('datosUsuario'));
  if (datos) {
    resultado.innerHTML = `
      <h3>Datos almacenados:</h3>
      <p><strong>Nombre:</strong> ${datos.nombre}</p>
      <p><strong>Correo:</strong> ${datos.correo}</p>
      <p><strong>Edad:</strong> ${datos.edad}</p>
    `;
  } else {
    resultado.innerHTML = '<p>No hay datos almacenados.</p>';
  }
});
