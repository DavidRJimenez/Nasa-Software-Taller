const btn = document.getElementById('obtener');
const resultado = document.getElementById('resultado');
const worker = new Worker('worker.js');

btn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    resultado.textContent = 'La geolocalización no es compatible con tu navegador.';
    return;
  }

  resultado.textContent = 'Obteniendo ubicación...';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const coords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      };

      worker.postMessage(coords);
    },
    (error) => {
      resultado.textContent = `Error obteniendo ubicación: ${error.message}`;
    }
  );
});


worker.onmessage = (e) => {
  resultado.textContent = `Resultado procesado: ${e.data}`;
};
