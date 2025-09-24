function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function afficher(position, container) {
  const c = position.coords;
  container.innerHTML = `
    Longitude : ${c.longitude} <br>
    Latitude : ${c.latitude} <br>
    Altitude : ${c.altitude !== null ? c.altitude + ' m' : 'Indisponible'} <br>
    Précision : ±${c.accuracy} m <br>
    Vitesse : ${c.speed !== null ? c.speed + ' m/s' : 'Indisponible'} <br>
    Date : ${formatDate(position.timestamp)}
  `;
}

window.onload = () => {
  console.log("Page chargée, script démarré");

  const currentDiv = document.getElementById('current');
  const watchDiv = document.getElementById('watch');

  if (!navigator.geolocation) {
    currentDiv.textContent = 'Géolocalisation non supportée.';
    watchDiv.textContent = 'Géolocalisation non supportée.';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      console.log("getCurrentPosition OK", pos);
      afficher(pos, currentDiv);
    },
    err => {
      console.error("Erreur getCurrentPosition", err);
      currentDiv.textContent = 'Erreur : ' + err.message;
    }
  );

  navigator.geolocation.watchPosition(
    pos => {
      console.log("watchPosition mise à jour", pos);
      afficher(pos, watchDiv);
    },
    err => {
      console.error("Erreur watchPosition", err);
      watchDiv.textContent = 'Erreur : ' + err.message;
    }
  );
};
