import mysql from "mysql2/promise";

const connection = mysql.createPool({
  uri: process.env.MYSQL_PUBLIC_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectTimeout: 30000,
  waitForConnections: true,
  connectionLimit: 10,
});

export default connection;