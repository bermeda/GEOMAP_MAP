document.getElementById('typeFilter').addEventListener('change', function () {
  const selected = this.value;
  map.eachLayer(layer => {
    if (layer.feature && layer.feature.properties) {
      const match = selected === 'all' || layer.feature.properties.type === selected;
      layer.setStyle({ opacity: match ? 1 : 0, fillOpacity: match ? 0.5 : 0 });
    }
  });
});
document.getElementById('typeFilter').addEventListener('change', function () {
  const selected = this.value;
  map.eachLayer(layer => {
    if (layer.feature && layer.feature.properties) {
      const match = selected === 'all' || layer.feature.properties.type === selected;
      layer.setStyle({ opacity: match ? 1 : 0, fillOpacity: match ? 0.5 : 0 });
    }
  });
});
const drawnItems = new L.FeatureGroup().addTo(map);
const drawControl = new L.Control.Draw({
  edit: { featureGroup: drawnItems },
  draw: {
    polygon: true,
    polyline: true,
    marker: true,
  }
});
map.addControl(drawControl);

// On draw
map.on(L.Draw.Event.CREATED, function (e) {
  const layer = e.layer;
  const geojson = layer.toGeoJSON();
  const geom = JSON.stringify(geojson.geometry);
  const type = prompt("Enter type (restaurant, river, school):");
  const name = prompt("Enter name:");

  fetch('http://localhost:3000/features', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type, geometry: geom })
  }).then(() => {
    map.addLayer(layer);
    alert("Feature added!");
  });
});

