import db from "./db";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const [rows] = await db.query(
    "SELECT * FROM agendamentos ORDER BY criado_em DESC"
  );

  res.status(200).json(rows);
}