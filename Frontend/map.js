// ===============================
// map.js - GIS Web Application
// ===============================

// --- Initialization ---

// Initialize the map and set view
const map = L.map('map').setView([51.505, -0.09], 13);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Layer to hold all GeoJSON features
const geojsonLayer = L.geoJSON(null, {
  onEachFeature: onEachFeature,
  style: dynamicStyle,
}).addTo(map);

// Variable to track active spatial query type ('within', 'intersect', or null)
let activeQuery = null;

// --- Leaflet Draw Controls Setup ---

const drawControl = new L.Control.Draw({
  draw: {
    polyline: true,
    polygon: true,
    circle: false,
    marker: true,
  },
  edit: {
    featureGroup: geojsonLayer,
    remove: true,
  },
});
map.addControl(drawControl);

// ===============================
// Event Handlers for Drawing & Editing
// ===============================

// Handle new feature creation (draw:created)
map.on('draw:created', async (event) => {
  const { layer } = event;
  const geometry = layer.toGeoJSON().geometry;

  // Check for spatial query mode when drawing polygons
  if (layer instanceof L.Polygon) {
    if (activeQuery === 'within') {
      await fetchPointsWithinPolygon(geometry);
      activeQuery = null;
      return;
    }
    if (activeQuery === 'intersect') {
      await fetchIntersectingFeatures(geometry);
      activeQuery = null;
      return;
    }
  }

  // Otherwise, add new feature to backend/database
  await addNewFeature(layer, geometry);
});

// Handle feature editing (draw:edited)
map.on('draw:edited', async (event) => {
  const { layers } = event;
  layers.eachLayer(async (layer) => {
    const updatedGeometry = layer.toGeoJSON().geometry;
    if (!layer.feature || !layer.feature.id) {
      console.warn('Edited layer missing feature id, skipping update');
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/features/${layer.feature.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geometry: updatedGeometry }),
      });
      const data = await response.json();
      console.log('Feature updated:', data);
    } catch (error) {
      console.error('Error updating feature:', error);
    }
  });
});

// Handle feature deletion (draw:deleted)
map.on('draw:deleted', async (event) => {
  const { layers } = event;
  layers.eachLayer(async (layer) => {
    if (!layer.feature || !layer.feature.id) {
      console.warn('Deleted layer missing feature id, skipping deletion');
      return;
    }
    try {
      await fetch(`http://localhost:3000/features/${layer.feature.id}`, {
        method: 'DELETE',
      });
      console.log('Feature deleted:', layer.feature.id);
    } catch (error) {
      console.error('Error deleting feature:', error);
    }
  });
});

// ===============================
// Feature Interaction & UI Helpers
// ===============================

// Fetch and display features, optionally filtered by category
async function fetchFeatures(filter = 'all') {
  try {
    const response = await fetch(`http://localhost:3000/features?category=${filter}`);
    const data = await response.json();

    geojsonLayer.clearLayers();

    data.forEach((feature) => {
      L.geoJSON(feature.geometry, {
        onEachFeature: onEachFeature,
        style: dynamicStyle,
      }).addTo(geojsonLayer);
    });
  } catch (error) {
    console.error('Error fetching features:', error);
  }
}

// Add new feature to backend
async function addNewFeature(layer, geometry) {
  try {
    const featureType = layer instanceof L.Marker
      ? 'point'
      : layer instanceof L.Polygon
      ? 'polygon'
      : 'line';

    const response = await fetch('http://localhost:3000/features', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Feature',
        type: featureType,
        category: 'unknown',
        geometry,
      }),
    });

    const data = await response.json();
    console.log('New feature added:', data);

    // Refresh feature layer after adding new feature
    fetchFeatures();
  } catch (error) {
    console.error('Error adding feature:', error);
  }
}

// Dynamic styling of features based on properties (e.g. population)
function dynamicStyle(feature) {
  if (!feature.properties) return {};
  return {
    color: feature.properties.population > 1000 ? 'red' : 'green',
    fillOpacity: 0.6,
    weight: 2,
  };
}

// Configure popups and sidebar interaction for each feature
function onEachFeature(feature, layer) {
  if (!feature.properties) return;

  layer.bindPopup(`
    <strong>${feature.properties.name || 'Unnamed'}</strong><br>
    Type: ${feature.properties.type || 'N/A'}
  `);

  layer.on('click', () => {
    const props = feature.properties;
    document.getElementById('feature-info-content').innerHTML = `
      <p><strong>Name:</strong> ${props.name || 'N/A'}</p>
      <p><strong>Type:</strong> ${props.type || 'N/A'}</p>
      <p><strong>Category:</strong> ${props.category || 'N/A'}</p>
    `;
    document.getElementById('sidebar').style.display = 'block';
  });

  // Attach feature ID to layer for edit/delete referencing
  layer.feature = feature;
}

// Close sidebar event
document.getElementById('close-sidebar').addEventListener('click', () => {
  document.getElementById('sidebar').style.display = 'none';
});

// Filter features by category dropdown
document.getElementById('featureFilter').addEventListener('change', (e) => {
  fetchFeatures(e.target.value);
});

// ===============================
// Spatial Query Functions
// ===============================

// Fetch points within a polygon
async function fetchPointsWithinPolygon(polygonGeoJSON) {
  try {
    const response = await fetch('http://localhost:3000/features/spatial/within', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ geometry: polygonGeoJSON }),
    });
    const data = await response.json();

    geojsonLayer.clearLayers();
    data.forEach((feature) => {
      L.geoJSON(feature.geometry, { onEachFeature: onEachFeature }).addTo(geojsonLayer);
    });
  } catch (error) {
    console.error('Error fetching points within polygon:', error);
  }
}

// Fetch features intersecting a polygon
async function fetchIntersectingFeatures(polygonGeoJSON) {
  try {
    const response = await fetch('http://localhost:3000/features/spatial/intersects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ geometry: polygonGeoJSON }),
    });
    const data = await response.json();

    geojsonLayer.clearLayers();
    data.forEach((feature) => {
      L.geoJSON(feature.geometry, { onEachFeature: onEachFeature }).addTo(geojsonLayer);
    });
  } catch (error) {
    console.error('Error fetching intersecting features:', error);
  }
}

// Fetch nearest features from a clicked location
async function fetchNearestFeatures(userLocation) {
  try {
    const response = await fetch('http://localhost:3000/features/spatial/nearest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        geometry: {
          type: 'Point',
          coordinates: [userLocation.lng, userLocation.lat],
        },
        category: 'restaurant', // Hardcoded category for example
      }),
    });
    const data = await response.json();

    geojsonLayer.clearLayers();
    data.forEach((feature) => {
      L.geoJSON(feature.geometry, { onEachFeature: onEachFeature }).addTo(geojsonLayer);
    });
  } catch (error) {
    console.error('Error fetching nearest features:', error);
  }
}

// ===============================
// Spatial Query Button Handlers
// ===============================

document.getElementById('btn-points-within').addEventListener('click', () => {
  activeQuery = 'within';
  alert('Draw a polygon to find points within it.');
});

document.getElementById('btn-intersect').addEventListener('click', () => {
  activeQuery = 'intersect';
  alert('Draw a polygon to find intersecting features.');
});

document.getElementById('btn-nearest').addEventListener('click', () => {
  alert('Click on the map to find nearest restaurants.');
  map.once('click', (e) => {
    fetchNearestFeatures(e.latlng);
  });
});

// ===============================
// Initial load of all features
// ===============================

fetchFeatures('all');
