// ===================================
// TD1 - Exercice 1 : Géolocalisation
// ===================================

function startGeoTD1() {
  const currentDiv = document.getElementById('current');
  const watchDiv = document.getElementById('watch');

  if (!navigator.geolocation) {
    currentDiv.textContent = 'Géolocalisation non supportée.';
    watchDiv.textContent = 'Géolocalisation non supportée.';
    return;
  }

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

  // Position actuelle avec getCurrentPosition
  navigator.geolocation.getCurrentPosition(
    pos => afficher(pos, currentDiv),
    err => currentDiv.textContent = 'Erreur getCurrentPosition : ' + err.message,
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );

  // Suivi en temps réel avec watxhPosition
  navigator.geolocation.watchPosition(
    pos => afficher(pos, watchDiv),
    err => watchDiv.textContent = 'Erreur watchPosition : ' + err.message,
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

// ============================================
// TD1 - Exercice 2 : Leaflet + Géolocalisation
// ============================================

function startMapTD1() {
  const marseille = [43.2965, 5.3698];
  const nice = [43.7102, 7.2620];
  const bermudes = [
    [25.774, -80.19],
    [18.466, -66.118],
    [32.321, -64.757]
  ];

  const map = L.map("map").setView(nice, 6);

  // Choix des fonds de carte
  const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  const stamen = L.tileLayer("https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png", {
    attribution: "© Stamen"
  });

  L.control.layers({ "OSM": osm, "Stamen": stamen }).addTo(map);

  // Marqueurs fixes
  L.marker(nice).addTo(map).bindPopup("Nice - Centre ville");
  L.polygon(bermudes, {color: "red"}).addTo(map).bindPopup("Triangle des Bermudes");

  // Localisation utilisateur
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;
      const userPos = [lat, lon];

      map.setView(userPos, 10);
      L.marker(userPos).addTo(map).bindPopup("Vous êtes ici").openPopup();
      L.circle(userPos, {radius: accuracy, color:"red", fillOpacity:0.2}).addTo(map);

      // Lignes entre villes
      L.polyline([marseille, nice], {color:"green"}).addTo(map).bindPopup("Marseille ↔ Nice");
      L.polyline([marseille, userPos], {color:"purple"}).addTo(map);

      // Distance Marseille ↔ Utilisateur (Haversine)
      const R = 6371;
      const toRad = x => x * Math.PI / 180;
      const dLat = toRad(lat - marseille[0]);
      const dLon = toRad(lon - marseille[1]);
      const a = Math.sin(dLat/2)**2 +
                Math.cos(toRad(marseille[0])) * Math.cos(toRad(lat)) *
                Math.sin(dLon/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = (R * c).toFixed(2);

      L.marker(marseille).addTo(map)
        .bindPopup(`Marseille<br>Distance : ${distance} km`)
        .openPopup();
    });
  }

  // Exemple GeoJSON
  const geojsonExample = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": { "name": "Point test" },
        "geometry": { "type": "Point", "coordinates": [7.25, 43.7] }
      }
    ]
  };

  L.geoJSON(geojsonExample).addTo(map);

  // OSRM route (Nice → Marseille)
  fetch("https://router.project-osrm.org/route/v1/driving/7.2620,43.7102;5.3698,43.2965?overview=full&geometries=geojson")
    .then(res => res.json())
    .then(data => {
      const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
      L.polyline(coords, {color:"orange"}).addTo(map).bindPopup("Route Nice → Marseille (OSRM)");
    });
}
