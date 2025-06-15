


<h2 align="center">Medhin Berhe Hagos</h2> 
<p align="center"><em>GIS Systems - University of Camerino</em></p> 
<h1 align="center">Geo Web Map</h1>
<p align="center"><em>A full-stack GIS web application for managing, visualizing, and analyzing spatial data using PostGIS, Node.js, and Leaflet.js.</em></p>
<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Leaflet.js-blue?logo=javascript" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?logo=node.js" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql" />
  <img src="https://img.shields.io/badge/GIS-PostGIS-orange?logo=mapbox" />
  <img src="https://img.shields.io/badge/License-MIT-purple?logo=open-source-initiative" />
</p>

### 📚 Table of Contents

- [📄 Abstract](#-abstract)
- [🌍 Introduction](#-introduction)
- [✨ Features](#-features)
- [🧪 Technologies Used](#-technologies-used)
- [🚀 Getting Started](#-getting-started)
  - [✅ Prerequisites](#-prerequisites)
  - [⚙️ Installation](#️-installation)
  - [🛠 Environment Configuration](#-environment-configuration)
- [🌐 API Endpoints](#-core-endpoints)
- [📊 UML Diagrams](#uml-class-diagram)
- [📄 License](#-license)
- [✅ Conclusion](#-conclusion)
- [🙏 Acknowledgements](#-acknowledgements)


 ### 📄 Abstract

Geo Web Map is a full-stack GIS web application that integrates a PostgreSQL/PostGIS spatial database, a Node.js/Express backend, and a Leaflet.js frontend to provide interactive geospatial data management and visualization. It allows users to create, read, update, delete, and analyze geospatial features through an intuitive web interface. Key functionalities include spatial filtering, attribute-based queries, dynamic styling, shortest-path routing via pgRouting, and geometry editing. This platform is ideal for academic, research, or professional use in GIS-related applications.


### 🌍 Introduction

**Geo Web Map**
 is a comprehensive full-stack GIS web application designed to enable users to manage, visualize, and analyze spatial data through an interactive web interface. Utilizing PostgreSQL with PostGIS extensions for powerful spatial data storage and querying, a Node.js backend API for business logic, and Leaflet.js for dynamic map visualization, the system supports:
- CRUD operations on spatial features (points, lines, polygons)
- Attribute and spatial filtering
- Routing and shortest path calculations using pgRouting
- Dynamic styling and map legends for intuitive data interpretation
This platform is ideal for GIS practitioners, researchers, and students aiming to explore spatial datasets efficiently.
## ✨ Features
### 🗺 Interactive Map Visualization
- Render points, lines, and polygons on an interactive Leaflet.js map
- Zoom, pan, click, and inspect feature attributes dynamically
### 🛠 CRUD Operations
- Create, read, update, and delete geospatial features
- Drag-and-drop editing of points and reshaping of lines/polygons
Supports creation, reading, updating, and deletion of three geometry types:
- `Point` (e.g., restaurant)
- `LineString` (e.g., rivers or roads)
- `Polygon` (e.g., building footprints or municipalities)
### ✅ Display Layer Elements
- Features from PostGIS are displayed dynamically on the map.
- Layers can be toggled, styled, and filtered based on properties and spatial conditions.
### 🔍 Filtering and Spatial Queries
- Filter features based on attributes (e.g., type, name)
- Perform spatial queries like intersection, containment, and nearest neighbors
- Find nearest features using pgRouting-enabled spatial indexing
- *Attribute-Based Filters*: Show only selected feature types like `restaurants`, `rivers`, or `schools`.
- *Spatial Queries*:
  - Show only features **within a selected polygon**.
  - Show **intersecting** geometries.
  - Show **features within certain area**.
  - Filter polygons by **surface area** using PostGIS functions. 

  ### 🧰 UI-Based Filters

The application includes a user-friendly interface for filtering spatial features.

- **Text Input Filter**: Filter by attribute like `type = 'school'`
- **Dropdown Selector**: Choose categories like:
  - `restaurants`
  - `rivers`
  - `schools`
  


Users can dynamically filter map layers without refreshing the page.

  ### ✅ Add New Features
  
- Users can add:
  - Points (e.g., click to drop a restaurant)
  - Lines (e.g., draw rivers or roads)
  - Polygons (e.g., draw buildings or districts)

  ### ✅ Edit Geometries

- Drag and drop points to update location.
- Modify vertices of lines and polygons using Leaflet Draw.
- Edits are stored in the PostgreSQL/PostGIS database.
### 🧭 Routing and Network Analysis
- Compute shortest paths on road networks via Dijkstra’s algorithm
- Visualize routes directly on the map interface
### 🎨 Dynamic Styling & Legends
- Style map elements dynamically based on data attributes
- Auto-generated legends to aid data interpretation

### ✅ Spatial Queries

- Example: Find the 5 nearest restaurants using `ST_Distance` or `ST_DWithin`.
- Interactive UI allows users to click a point and see nearest features.

### ✅ Routing Functionality

- Route calculation from current user location to a destination (e.g., restaurant).
- Uses pgRouting and Dijkstra algorithm for lowest-cost path.
- Road network topology is created in PostGIS and used in backend API.

### ✅ Routing Functionality

- Route calculation from current user location to a destination (e.g., restaurant).
- Uses pgRouting and Dijkstra algorithm for lowest-cost path.
- Road network topology is created in PostGIS and used in backend API.

### 📌 Project Goals Summary

### ✅ CRUD on GIS data
### ✅ Display points, lines, polygons
### ✅ Attribute & spatial filtering
### ✅ Geometry editing via web UI
### ✅ Dynamic styling and legends
### ✅ Nearest feature search
### ✅ Route finding with pgRouting

### 🧪 Technologies Used


# Component | Technology

# Frontend = Leaflet.js, HTML, CSS, JS

# Backend = Node.js, Express.js

# Database = PostgreSQL + PostGIS + pgRouting

# Visualization =Leaflet.js

# Dev Tools = pgAdmin 4, VS Code
# Version Control | Git & GitHub



## 🚀 Getting Started

### ✅ Prerequisites

Ensure you have installed the following software:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [PostgreSQL](https://www.postgresql.org/) (version 13 or higher)
- [PostGIS](https://postgis.net/)
- [pgRouting](https://pgrouting.org/)

---

### ⚙️ Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/geo-web-map.git
cd geo-web-map
CREATE DATABASE geomap;
\c geomap
CREATE EXTENSION postgis;
CREATE EXTENSION pgrouting;
CREATE TABLE gis_features (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    geom GEOMETRY
);

CREATE TABLE roads (
    id SERIAL PRIMARY KEY,
    source INTEGER,
    target INTEGER,
    cost FLOAT,
    reverse_cost FLOAT,
    geom GEOMETRY(LINESTRING)
);
cd backend
npm install
node index.js
🛠 Environment Configuration

Create a `.env` file inside the `/backend` directory to store your database connection settings securely:

```env
 .env file (backend)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=geomap
DB_USER=postgres
DB_PASS='Meda@1221BM'
PORT=3001

🔌 Backend Overview

The **Geo Features API** is the backend service that powers the Geo Web Map application. It provides RESTful endpoints to manage, query, and analyze geospatial data stored in a PostgreSQL/PostGIS database.

Welcome to the Geo Features API — the backend service of the Geo Web Map project.

 🌐 API Base URL


 🧭 Core Endpoints

|===
| Method | Endpoint        | Description

| GET    | /features        | Retrieve all geospatial features
| POST   | /features        | Add a new feature (point, line, polygon)
| PUT    | /features/:id    | Update an existing feature
| DELETE | /features/:id    | Delete a feature
| GET    | /route           | Compute shortest path route (via pgRouting)
| GET    | /nearest         | Find nearest features to a given location
|===


cd ../frontend
npm install
npm start
curl http://localhost:3001/features
curl -X POST -H "Content-Type: application/json" \
     -d '{"name":"Park","geom":"POINT(12.34 56.78)"}' \
     http://localhost:3001/features


 UML Class Diagram


Classes and Relationships

             +------------------+
             |      User        |
             +--------+---------+
                      |
  +-------------------+-------------------------------+
  |                                                   |
  v                                                   v
[View Map Layers]                             [Add New Features]
       |                                              |
       v                                              v
[Filter by Attributes]                          [Add Point / Line / Polygon]
[Filter by Spatial Queries]                            |
                                                       v
                                              [Edit Geometry]
                                                   |
                                       +-----------+------------+
                                       |           |            |
                                   [Move Point] [Edit Line] [Edit Polygon]

  v                                                   v
[Dynamic Styling]                             [Delete Features]

  v
[Run Spatial Queries]
      |
      v
[Find 5 Nearest Features]

  v
[Routing to Feature]
      |
      v
[Shortest Path via Dijkstra]

   


UML Use Case Diagram


                +-------------------------+
                |        Web User         |
                +-------------------------+
                     |        |         |
     ----------------        |          -------------------
    |                         |                          |
+------------+         +----------------+       +-------------------+
| CRUD Layer |         | Spatial Filter |       |    Routing        |
+------------+         +----------------+       +-------------------+
| Create     |         | Filter by attr |       | Find Route        |
| Read       |         | Spatial filter |       | Build Topology    |
| Update     |         +----------------+       +-------------------+
| Delete     |
+------------+


UML Sequence Diagram (Example: Add New Polygon)

User -> WebInterface : drawPolygon()
WebInterface -> MapController : createFeature(type: polygon, data)
MapController -> MapService : addFeature(data)
MapService -> DB : INSERT INTO features ...
DB -> MapService : success
MapService -> MapController : success
MapController -> WebInterface : render new polygon

📄 License

MIT License

Copyright (c) 2025 Medhin Berhe Hagos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell   
copies of the Software, and to permit persons to whom the Software is      
furnished to do so, subject to the following conditions:                    

The above copyright notice and this permission notice shall be included in all   
copies or substantial portions of the Software.                                  

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
SOFTWARE.


✅ Conclusion

The Geo Web Map project successfully demonstrates the integration of spatial databases, backend APIs, and frontend mapping tools to build an interactive geospatial application. Through PostgreSQL/PostGIS, Node.js, and Leaflet.js, the system supports complete geospatial CRUD operations, spatial filtering, geometry editing, and routing via pgRouting. It provides a solid foundation for both academic and professional GIS development, and its modular architecture allows for future enhancements such as authentication, data import/export, and cloud deployment. This project showcases practical GIS skills and reinforces full-stack development techniques tailored for spatial data analysis.

 🙏 Acknowledgements

- PostGIS and pgRouting community for spatial database and routing support  
- Leaflet.js for providing powerful and lightweight map visualization  
- Node.js and Express.js for robust backend development  
- Open source tutorials and GitHub repositories for guidance and references  
- OpenStreetMap for base maps and sample geospatial datasets  
- University of Camerino – GIS Systems course for academic foundation  
-XHINA ENDRIT . for guidance and supervision throughout the project  













