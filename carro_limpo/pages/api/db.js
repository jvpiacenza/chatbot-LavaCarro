import mysql from "mysql2/promise";

const connection = mysql.createPool(process.env.MYSQL_PUBLIC_URL);

export default connection;