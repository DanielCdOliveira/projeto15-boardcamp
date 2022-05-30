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
app.post("/categories", async (req, res) => {
  const { name } = req.body;
  console.log(name);
  if (name === "") return res.sendStatus(400);
  try {
    const categories = (await connection.query("SELECT * FROM categories"))
      .rows;
    console.log(categories);
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
});
// GAMES
app.get("/games", (req, res) => {
  let name = req.query.name;
  name = name + "%";
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
      [rental.customerId, rental.gameId, rental.daysRented, date, originalPrice]
    )
    .then(() => {
      res.sendStatus(201);
    });
});

app.get("/rentals", async (req, res) => {
  const rentalsResult = await connection.query(`
  SELECT rentals.*, customers.name as "customerName", categories.name as "categoryName",games."categoryId",games.name as "gameName" 
  FROM rentals 
  JOIN customers 
    ON rentals."customerId"=customers.id 
  JOIN categories 
    ON rentals."gameId"=categories.id
  JOIN games 
    ON rentals."gameId"=games.id`);
  const rentals = rentalsResult.rows.map((e) => {
    return {
      ...e,
      customer: {
        id: e.customerId,
        name: e.customerName,
      },
      game: {
        id: e.gameId,
        name: e.gameName,
        categoryId: e.categoryId,
        categoryName: e.categoryName,
      },
    };
  });
  res.send(rentals);
});

app.post("/rentals/:id/return", async (req, res) => {
  const { id } = req.params;
  const date = dayjs().format("YYYY-MM-DD");
  try {
    const rental = await (
      await connection.query(
        `
     SELECT "rentDate","daysRented","originalPrice" FROM rentals
    WHERE id = $1  
    `,
        [id]
      )
    ).rows[0];
    if (!rental) return res.sendStatus(404);
    if (rental.returnDate) return res.sendStatus(400);
    const pricePerDay = rental.originalPrice / rental.daysRented;
    const day1 = new Date(rental.rentDate);
    const day2 = new Date(date);
    const difference = Math.abs(day2 - day1);
    let days = difference / (1000 * 3600 * 24) + 0.125;
    if (days > rental.daysRented) {
      await connection.query(
        `
      UPDATE rentals SET "returnDate"=$1,"delayFee"=$2 where id = $3      
      `,
        [date, (days - rental.daysRented) * pricePerDay, id]
      );
    } else {
      await connection.query(
        `
      UPDATE rentals SET "returnDate"=$1 where id = $2      
      `,
        [date, id]
      );
    }

    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
});

app.delete("/rentals/:id", async (req, res) => {
  const { id } = req.params;
  console.log();
  const rental = (
    await connection.query(`SELECT * FROM rentals WHERE id=$1`, [id])
  ).rows;
  console.log(rental);
  if (!rental) return res.sendStatus(404);
  if (rental.returnDate) return res.sendStatus(400);
  await connection.query(`DELETE FROM rentals WHERE id=$1`, [id]);
  res.sendStatus(200);
});

const port = process.env.PORT;
app.listen(port, () =>
  console.log(chalk.bold.green(`Servidor em pé na porta ${port}`))
);
