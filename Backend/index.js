const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Root
app.get('/', (req, res) => {
  res.send('Welcome to the Geo Features API');
});

// ✅ GET all features (optionally filtered)
app.get('/features', async (req, res) => {
  const { type, category } = req.query;
  let query = `SELECT id, name, type, category, ST_AsGeoJSON(geom)::json as geometry FROM gis_features WHERE true`;
  let params = [];

  if (type) {
    query += ` AND type = $${params.length + 1}`;
    params.push(type);
  }

  if (category) {
    query += ` AND category = $${params.length + 1}`;
    params.push(category);
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /features error:', err);
    res.status(500).send('Database error');
  }
});

// ✅ POST: Add a new feature
app.post('/features', async (req, res) => {
  const { name, type, category, geometry } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO gis_features (name, type, category, geom)
       VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4), 4326)) RETURNING *`,
      [name, type, category, JSON.stringify(geometry)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /features error:', err);
    res.status(500).send('Error adding feature');
  }
});

// ✅ PUT: Update geometry only
app.put('/features/:id', async (req, res) => {
  const id = req.params.id;
  const { geometry } = req.body;

  try {
    const result = await pool.query(
      `UPDATE gis_features SET geom = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) WHERE id = $2 RETURNING *`,
      [JSON.stringify(geometry), id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /features/:id error:', err);
    res.status(500).send('Error updating geometry');
  }
});

// ✅ PUT: Update name/type/category
app.put('/features/:id/info', async (req, res) => {
  const id = req.params.id;
  const { name, type, category } = req.body;

  try {
    const result = await pool.query(
      `UPDATE gis_features SET name = $1, type = $2, category = $3 WHERE id = $4 RETURNING *`,
      [name, type, category, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /features/:id/info error:', err);
    res.status(500).send('Error updating feature info');
  }
});

// ✅ DELETE feature
app.delete('/features/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query(`DELETE FROM gis_features WHERE id = $1`, [id]);
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /features/:id error:', err);
    res.status(500).send('Error deleting feature');
  }
});

// ✅ Spatial Queries
app.post('/features/spatial/within', async (req, res) => {
  const { geometry } = req.body;

  try {
    const result = await pool.query(
      `SELECT id, name, type, ST_AsGeoJSON(geom)::json as geometry
       FROM gis_features
       WHERE ST_Within(geom, ST_SetSRID(ST_GeomFromGeoJSON($1), 4326))`,
      [JSON.stringify(geometry)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('POST /features/spatial/within error:', err);
    res.status(500).send('Error performing spatial query');
  }
});

app.post('/features/spatial/intersects', async (req, res) => {
  const { geometry } = req.body;

  try {
    const result = await pool.query(
      `SELECT id, name, type, ST_AsGeoJSON(geom)::json as geometry
       FROM gis_features
       WHERE ST_Intersects(geom, ST_SetSRID(ST_GeomFromGeoJSON($1), 4326))`,
      [JSON.stringify(geometry)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('POST /features/spatial/intersects error:', err);
    res.status(500).send('Error performing spatial intersection');
  }
});

app.get('/features/spatial/area', async (req, res) => {
  const minArea = parseFloat(req.query.minArea || 0);

  try {
    const result = await pool.query(
      `SELECT id, name, type, ST_AsGeoJSON(geom)::json as geometry
       FROM gis_features
       WHERE ST_GeometryType(geom) = 'ST_Polygon' AND ST_Area(geom::geography) > $1`,
      [minArea]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /features/spatial/area error:', err);
    res.status(500).send('Error filtering by area');
  }
});

app.post('/features/spatial/nearest', async (req, res) => {
  const { geometry, category } = req.body;

  try {
    const result = await pool.query(
      `SELECT id, name, type, category, ST_AsGeoJSON(geom)::json as geometry
       FROM gis_features
       WHERE category = $2
       ORDER BY geom <-> ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)
       LIMIT 5`,
      [JSON.stringify(geometry), category]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('POST /features/spatial/nearest error:', err);
    res.status(500).send('Error finding nearest features');
  }
});

// ✅ Routing
app.post('/routing', async (req, res) => {
  const { sourceId, targetId } = req.body;

  try {
    const result = await pool.query(
      `SELECT seq, id1 AS node, id2 AS edge, cost
       FROM pgr_dijkstra(
         'SELECT id, source, target, cost FROM roads',
         $1, $2, false
       )`,
      [sourceId, targetId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('POST /routing error:', err);
    res.status(500).send('Error computing shortest path');
  }
});

app.post('/routing/geometry', async (req, res) => {
  const { edgeIds } = req.body;

  try {
    const result = await pool.query(
      `SELECT ST_AsGeoJSON(ST_Collect(geom))::json as geometry
       FROM roads
       WHERE id = ANY($1)`,
      [edgeIds]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('POST /routing/geometry error:', err);
    res.status(500).send('Error getting route geometry');
  }
});

// ✅ Get distinct categories for legend/styling
app.get('/features/categories', async (req, res) => {
  try {
    const result = await pool.query(`SELECT DISTINCT category FROM gis_features`);
    res.json(result.rows.map(row => row.category));
  } catch (err) {
    console.error('GET /features/categories error:', err);
    res.status(500).send('Error retrieving categories');
  }
});

// ✅ Export all features as GeoJSON
app.get('/features/export', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT jsonb_build_object(
         'type', 'FeatureCollection',
         'features', jsonb_agg(
           jsonb_build_object(
             'type', 'Feature',
             'geometry', ST_AsGeoJSON(geom)::jsonb,
             'properties', to_jsonb(gis_features) - 'geom'
           )
         )
       ) as geojson
       FROM gis_features`
    );
    res.json(result.rows[0].geojson);
  } catch (err) {
    console.error('GET /features/export error:', err);
    res.status(500).send('Error exporting features');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
app.get('/api/route', async (req, res) => {
  const { start_id, end_id } = req.query;

  if (!start_id || !end_id) {
    return res.status(400).json({ error: 'start_id and end_id are required' });
  }

  try {
    const result = await pool.query(
      `SELECT seq, id1 AS node, id2 AS edge, cost, ST_AsGeoJSON(geom)::json AS geometry 
       FROM get_route($1, $2)`,
      [parseInt(start_id), parseInt(end_id)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching route:', err);
    res.status(500).json({ error: 'Routing query failed' });
  }
});
app.get('/features/spatial/area', async (req, res) => {
  const minArea = parseFloat(req.query.minArea || 0);

  try {
    const result = await pool.query(
      `SELECT id, name, type, ST_AsGeoJSON(geom)::json as geometry
       FROM gis_features
       WHERE ST_GeometryType(geom) = 'ST_Polygon' AND ST_Area(geom::geography) > $1`,
      [minArea]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /features/spatial/area error:', err);
    res.status(500).send('Error filtering by area');
  }
});
app.get('/features/spatial/area', async (req, res) => {
  const minArea = parseFloat(req.query.minArea || 0);

  try {
    const result = await pool.query(
      `SELECT id, name, type, ST_AsGeoJSON(geom)::json as geometry
       FROM gis_features
       WHERE ST_GeometryType(geom) = 'ST_Polygon' AND ST_Area(geom::geography) > $1`,
      [minArea]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /features/spatial/area error:', err);
    res.status(500).send('Error filtering by area');
  }
});
