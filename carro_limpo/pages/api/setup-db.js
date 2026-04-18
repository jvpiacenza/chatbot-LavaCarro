import db from "./db";

export default async function handler(req, res) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS agendamentos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      placa VARCHAR(20) NOT NULL,
      servico VARCHAR(100) NOT NULL,
      horario VARCHAR(50) NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  res.status(200).json({ ok: true, message: "Tabela criada!" });
}