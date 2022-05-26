import express, { json } from "express";
import chalk from "chalk";
import cors from "cors";
import dotenv from "dotenv";

import connection from "./db.js";

const app = express();
app.use(cors());
app.use(json());
dotenv.config();

app.get("/categories",(req, res) => {
    connection.query('SELECT * FROM categories').then(categories=>{res.send(categories.rows)});
});

app.get("/rentals", (req, res) => {});
app.get("/rentals", (req, res) => {});
app.get("/rentals", (req, res) => {});

const port = process.env.PORT;
app.listen(port, () =>
  console.log(chalk.bold.green(`Servidor em pé na porta ${port}`))
);
