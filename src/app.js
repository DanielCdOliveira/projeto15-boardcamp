import express, { json } from "express";
import chalk from "chalk";
import cors from "cors";
import dotenv from "dotenv";
import dayjs from "dayjs";
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
});

// CUSTOMERS
app.get("/customers", (req, res) => {
  connection.query("SELECT * FROM customers").then((games) => {
    res.send(games.rows);
  });
});
app.get("/customers/:id", (req, res) => {
  const { id } = req.params;
  connection
    .query("SELECT * FROM customers WHERE id=$1", [id])
    .then((games) => {
      res.send(games.rows[0]);
    });
});
app.post("/customers", (req, res) => {
  const customer = req.body;
  console.log(customer);
  connection
    .query(
      `
   INSERT INTO customers (name,phone,cpf,birthday)
   VALUES ($1,$2,$3,$4)`,
      [customer.name, customer.phone, customer.cpf, customer.birthday]
    )
    .then(() => {
      res.sendStatus(201);
    });
});
app.put("/customers/:id", (req, res) => {
  console.log(req.body);
  const customer = req.body;
  const { id } = req.params;
  console.log(id);
  connection
    .query(
      `
   UPDATE customers SET name=$1,phone=$2,cpf=$3,birthday=$4 WHERE id=$5`,
      [customer.name, customer.phone, customer.cpf, customer.birthday, id]
    )
    .then(() => {
      res.sendStatus(200);
    });
});

// RENTALS
app.post("/rentals", async (req, res) => {
  const rental = req.body;
  const date = dayjs().format("YYYY-MM-DD");
  const originalPrice =
    (await (
      await connection.query(
        `SELECT games."pricePerDay" FROM games WHERE id=$1`,
        [rental.gameId]
      )
    ).rows[0].pricePerDay) * rental.daysRented;
  console.log(originalPrice);
  connection
    .query(
      `
   INSERT INTO rentals ("customerId","gameId","daysRented","rentDate","originalPrice")
   VALUES ($1,$2,$3,$4,$5)`,
      [rental.customerId, rental.gameId,rental.daysRented,date,originalPrice]
    )
    .then(() => {
      res.sendStatus(201);
    });
});

const port = process.env.PORT;
app.listen(port, () =>
  console.log(chalk.bold.green(`Servidor em pé na porta ${port}`))
);
