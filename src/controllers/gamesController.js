import connection from "../db.js";

export async function getGames(req, res) {
  let name = req.query.name;
  console.log(name);
  try {
    if (!name) {
      connection
        .query(
          `SELECT  games.*, categories.name as "categoryName" 
          FROM games 
          JOIN categories 
          ON games."categoryId"=categories.id`
        )
        .then((games) => {
          res.send(games.rows);
        });
    } else {
      name = name.toLowerCase() + "%";
      console.log(name);
      connection
        .query(
          `SELECT  games.*, categories.name as "categoryName" 
          FROM games
          JOIN categories 
          ON games."categoryId"=categories.id WHERE LOWER(games.name) LIKE $1`,
          [name]
        )
        .then((games) => {
          console.log(games.rows);
          res.send(games.rows);
        });
    }
  } catch {
    res.sendStatus(500);
  }
}
export async function postGames(req, res) {
  const game = req.body;
  console.log(game);
  try {
    const categories = await connection.query(
      `
      SELECT * FROM categories WHERE id = $1
        `,
      [game.categoryId]
    );
    console.log(categories.rows);
    if (
      game.name === "" ||
      game.stockTotal <= 0 ||
      game.pricePerDay <= 0 ||
      categories.rowCount === 0
    )
      return res.sendStatus(400);
    const games = await connection.query(
      `
      SELECT * FROM games
      WHERE LOWER(games.name) LIKE $1
        `,
      [game.name.toLowerCase() + "%"]
    );
    console.log(games);
    if (games.rowCount !== 0) return res.sendStatus(409);

    connection
      .query(
        `
     INSERT INTO games ("name","image","stockTotal","categoryId","pricePerDay")
     VALUES ($1,$2,$3,$4,$5)`,
        [
          game.name,
          game.image,
          game.stockTotal,
          game.categoryId,
          game.pricePerDay,
        ]
      )
      .then(() => {
        res.sendStatus(201);
      });
  } catch {
    res.sendStatus(500);
  }
}
