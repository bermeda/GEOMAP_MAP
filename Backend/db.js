// db.js
const { Pool } = require('pg');

// Create a pool of connections to PostgreSQL
const pool = new Pool({
  user: 'postgres',    
  host: 'localhost',       
  database: 'postgres',     
  password: 'Meda@1221BM',  
  port: 5432,              
});

module.exports = pool;

