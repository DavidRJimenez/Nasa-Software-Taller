onmessage = function (e) {
  const { lat, lon } = e.data;

  const texto = `Tu ubicación es: Latitud ${lat.toFixed(4)}, Longitud ${lon.toFixed(4)}`;

  postMessage(texto);
};
