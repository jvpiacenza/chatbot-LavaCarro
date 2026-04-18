import db from "./db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const [rows] = await db.query(
      "SELECT * FROM agendamentos ORDER BY horario ASC"
    );
    return res.status(200).json(rows);
  }

  if (req.method === "DELETE") {
    const { id } = req.body;
    await db.query("DELETE FROM agendamentos WHERE id = ?", [id]);
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}