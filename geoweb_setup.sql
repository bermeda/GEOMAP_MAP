CREATE TABLE gis_features (
    id SERIAL PRIMARY KEY,
    name TEXT,
    type TEXT,
    geom GEOMETRY
);
INSERT INTO gis_features (name, type, geom)
VALUES ('Pizza Place', 'restaurant', ST_SetSRID(ST_MakePoint(13.5, 42.9), 4326));
INSERT INTO gis_features (name, type, geom)
VALUES ('Blue River', 'river', ST_SetSRID(ST_MakeLine(ARRAY[
    ST_MakePoint(13.4, 42.9),
    ST_MakePoint(13.6, 42.95)
]), 4326));
INSERT INTO gis_features (name, type, geom)
VALUES ('Central School', 'school', ST_SetSRID(ST_MakePolygon(ST_MakeLine(ARRAY[
    ST_MakePoint(13.4, 42.8),
    ST_MakePoint(13.5, 42.8),
    ST_MakePoint(13.5, 42.85),
    ST_MakePoint(13.4, 42.85),
    ST_MakePoint(13.4, 42.8)
])), 4326));
SELECT id, name, type, ST_AsGeoJSON(geom) as geometry
FROM gis_features
WHERE type = 'restaurant';
SELECT id, name, type, ST_AsGeoJSON(geom) as geometry
FROM gis_features
WHERE ST_Within(geom, ST_SetSRID(ST_MakePolygon(ST_MakeLine(ARRAY[
    ST_MakePoint(13.3, 42.7),
    ST_MakePoint(13.7, 42.7),
    ST_MakePoint(13.7, 43.1),
    ST_MakePoint(13.3, 43.1),
    ST_MakePoint(13.3, 42.7)
])), 4326));
SELECT id, name, type, ST_AsGeoJSON(geom) as geometry
FROM gis_features
WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint(13.5, 42.9), 4326), 1000); 
SELECT id, name, type, ST_AsGeoJSON(geom) as geometry
FROM gis_features
WHERE ST_Intersects(geom, ST_SetSRID(ST_MakePolygon(ST_MakeLine(ARRAY[
    ST_MakePoint(13.3, 42.8),
    ST_MakePoint(13.7, 42.8),
    ST_MakePoint(13.7, 43.0),
    ST_MakePoint(13.3, 43.0),
    ST_MakePoint(13.3, 42.8)
])), 4326));
UPDATE gis_features
SET geom = ST_SetSRID(ST_MakePoint(13.6, 42.91), 4326)
WHERE id = 1 AND type = 'restaurant';
UPDATE gis_features
SET geom = ST_SetSRID(ST_MakeLine(ARRAY[
    ST_MakePoint(13.4, 42.9),
    ST_MakePoint(13.7, 42.95)
]), 4326)
WHERE id = 2 AND type = 'river';
UPDATE gis_features
SET geom = ST_SetSRID(ST_MakePolygon(ST_MakeLine(ARRAY[
    ST_MakePoint(13.4, 42.75),
    ST_MakePoint(13.55, 42.75),
    ST_MakePoint(13.55, 42.9),
    ST_MakePoint(13.4, 42.9),
    ST_MakePoint(13.4, 42.75)
])), 4326)
DELETE FROM gis_features
WHERE id = 3 AND type = 'school';
DELETE FROM gis_features
WHERE id = 1 AND type = 'restaurant';
DELETE FROM gis_features
WHERE type = 'river';
DELETE FROM gis_features
WHERE name = 'Central School';
SELECT id, name, type, ST_AsGeoJSON(geom) as geometry FROM gis_features;
CREATE INDEX idx_geom ON gis_features USING GIST (geom);
-- New restaurant
INSERT INTO gis_features (name, type, geom)
VALUES ('Burger House', 'restaurant', ST_SetSRID(ST_MakePoint(13.52, 42.91), 4326));

-- New river
INSERT INTO gis_features (name, type, geom)
VALUES ('Green Stream', 'river', ST_SetSRID(ST_MakeLine(ARRAY[
    ST_MakePoint(13.4, 42.92),
    ST_MakePoint(13.7, 42.93)
]), 4326));

-- New school
INSERT INTO gis_features (name, type, geom)
VALUES ('East School', 'school', ST_SetSRID(ST_MakePolygon(ST_MakeLine(ARRAY[
    ST_MakePoint(13.45, 42.75),
    ST_MakePoint(13.55, 42.75),
    ST_MakePoint(13.55, 42.85),
    ST_MakePoint(13.45, 42.85),
    ST_MakePoint(13.45, 42.75)
])), 4326));
SELECT id, name, type, ST_AsGeoJSON(geom) AS geometry
FROM gis_features
WHERE type = 'restaurant'
ORDER BY geom <-> ST_SetSRID(ST_MakePoint(13.5, 42.9), 4326)
LIMIT 5;
CREATE TABLE roads (
    id SERIAL PRIMARY KEY,
    source INTEGER,
    target INTEGER,
    cost DOUBLE PRECISION,
    geom GEOMETRY(LineString, 4326)
);
INSERT INTO roads (geom, cost)
VALUES 
(ST_SetSRID(ST_MakeLine(ARRAY[
    ST_MakePoint(13.4, 42.9),
    ST_MakePoint(13.5, 42.9)
]), 4326), 1.0),

(ST_SetSRID(ST_MakeLine(ARRAY[
    ST_MakePoint(13.5, 42.9),
    ST_MakePoint(13.6, 42.91)
]), 4326), 1.5);
SELECT * FROM pg_extension;
SELECT pgr_createTopology('roads', 0.0001, 'geom', 'id');
SELECT seq, node, edge, cost
FROM pgr_dijkstra(
    'SELECT id, source, target, cost FROM roads',
    1, 3, false
);
SELECT id, ST_AsText(geom) FROM roads;
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
SELECT pgr_version();
SELECT * FROM pg_extension WHERE extname = 'pgrouting';
SELECT pgr_createTopology('roads', 0.0001, 'geom', 'id');
SELECT * FROM roads_vertices_pgr;
ALTER TABLE gis_features ADD COLUMN population INTEGER;
ALTER TABLE gis_features ADD COLUMN category TEXT;

































