import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

export default function Home() {
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const mapRef = useRef(null);
  const featureLayerGroupRef = useRef(null);
  const drawControlRef = useRef(null);
  const polygonQueryLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Initialize map once
  useEffect(() => {
    mapRef.current = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapRef.current);

    featureLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    polygonQueryLayerRef.current = L.layerGroup().addTo(mapRef.current);
    routeLayerRef.current = L.layerGroup().addTo(mapRef.current);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: featureLayerGroupRef.current,
      },
      draw: {
        circle: false,
        marker: true,
        polyline: true,
        polygon: true,
        rectangle: true,
      },
    });
    mapRef.current.addControl(drawControl);
    drawControlRef.current = drawControl;

    mapRef.current.on(L.Draw.Event.CREATED, async (e) => {
      const layer = e.layer;
      const geojson = layer.toGeoJSON();

      if (geojson.geometry.type === 'Polygon') {
        const response = await fetch('/api/spatial/within', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geojson.geometry),
        });
        const result = await response.json();
        polygonQueryLayerRef.current.clearLayers();
        result.forEach((feat) => {
          const marker = L.geoJSON(feat);
          marker.addTo(polygonQueryLayerRef.current);
        });
      } else {
        await fetch('/api/features', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geojson),
        });
        loadFeatures();
      }
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  const loadFeatures = async () => {
    let url = '/api/features';
    if (filterType !== 'all') {
      url += `?type=${filterType}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    setFeatures(data);
  };

  // Fetch and display features when map is ready or filter changes
  useEffect(() => {
    if (!mapRef.current) return;
    loadFeatures();
  }, [filterType]);

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadFeatures, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Update feature layers on map when features change
  useEffect(() => {
    if (!featureLayerGroupRef.current) return;

    featureLayerGroupRef.current.clearLayers();

    features.forEach((feature) => {
      let layer;
      let color = feature.properties.type === 'restaurant' ? 'orange'
        : feature.properties.type === 'school' ? 'blue'
        : feature.properties.type === 'river' ? 'green'
        : 'gray';

      if (feature.type === 'Point') {
        layer = L.circleMarker([
          feature.geometry.coordinates[1],
          feature.geometry.coordinates[0]
        ], {
          radius: 8,
          color,
          fillColor: color,
          fillOpacity: 0.5
        });
      } else if (feature.type === 'LineString') {
        layer = L.polyline(
          feature.geometry.coordinates.map((c) => [c[1], c[0]]),
          { color, weight: 3 }
        );
      } else if (feature.type === 'Polygon') {
        layer = L.polygon(
          feature.geometry.coordinates[0].map((c) => [c[1], c[0]]),
          { color, fillColor: color, fillOpacity: 0.5 }
        );
      }

      layer.on('click', () => setSelectedFeature(feature));
      featureLayerGroupRef.current.addLayer(layer);
    });
  }, [features]);

  return (
    <div style={{ position: 'relative' }}>
      <h1>GeoMap Web App</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="filter">Filter by type: </label>
        <select
          id="filter"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All</option>
          <option value="restaurant">Restaurants</option>
          <option value="school">Schools</option>
          <option value="river">Rivers</option>
        </select>
        <label style={{ marginLeft: '1rem' }}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          /> Auto-Refresh
        </label>
      </div>

      <div
        id="map"
        style={{ height: '500px', width: '100%', border: '1px solid #ccc' }}
      ></div>

      {selectedFeature && (
        <aside
          style={{
            position: 'absolute',
            top: '10%',
            right: '10px',
            backgroundColor: 'white',
            padding: '1rem',
            border: '1px solid #ccc',
            zIndex: 1000,
            width: '250px',
            maxHeight: '70vh',
            overflowY: 'auto',
          }}
        >
          <button
            style={{ marginBottom: '1rem' }}
            onClick={() => setSelectedFeature(null)}
          >
            Close
          </button>
          <h2>{selectedFeature.properties.name}</h2>
          <p>
            <strong>Type:</strong> {selectedFeature.type}
          </p>
          <pre>{JSON.stringify(selectedFeature.properties, null, 2)}</pre>
        </aside>
      )}
    </div>
  );
}
