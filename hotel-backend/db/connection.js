const mysql = require('mysql2');

//Altere para seus dados de conexão
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'hotel_control',
});

module.exports = pool.promise();
