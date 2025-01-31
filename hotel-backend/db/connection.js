const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'hotel_control',
});

// Exportando conexão com suporte a Promises
module.exports = pool.promise();
