import express, { json } from "express";
import chalk from "chalk";
import cors from "cors";
import dotenv from "dotenv";

import connection from "./db.js";

const app = express();
app.use(cors());
app.use(json());
dotenv.config();
// CATEGORIES
app.get("/categories", (req, res) => {
  connection.query("SELECT * FROM categories").then((categories) => {
    res.send(categories.rows);
  });
});
app.post("/categories", (req, res) => {
  const { name } = req.body;
  connection
    .query("INSERT INTO categories (name) VALUES ($1)", [name])
    .then(() => {
      res.sendStatus(201);
    });
});
// GAMES
app.get("/games", (req, res) => {
  connection
    .query(
      'SELECT  games.*, categories.name as "categoryName" FROM games JOIN categories ON games."categoryId"=categories.id'
    )
    .then((games) => {
      res.send(games.rows);
    });
});
app.post("/games", (req, res) => {
  const game = req.body;
  console.log(game);
   connection.query(`
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
});

const port = process.env.PORT;
app.listen(port, () =>
  console.log(chalk.bold.green(`Servidor em pé na porta ${port}`))
);
