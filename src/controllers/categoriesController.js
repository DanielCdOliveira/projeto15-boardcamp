import connection from "../db.js";

export async function getCategories(req, res) {
  connection.query("SELECT * FROM categories").then((categories) => {
    res.send(categories.rows);
  });
}
export async function postCategories(req, res) {
  const { name } = req.body;
  if (name === "") return res.sendStatus(400);
  try {
    const categories = (await connection.query("SELECT * FROM categories"))
      .rows;
    categories.forEach((e) => {
      if (e.name === name) return res.sendStatus(409);
    });
    connection
      .query("INSERT INTO categories (name) VALUES ($1)", [name])
      .then(() => {
        res.sendStatus(201);
      });
  } catch (error) {
    res.sendStatus(500);
  }
}
