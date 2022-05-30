import connection from "../db.js";
import joi from "joi";
// joi
const customerSchema = joi.object({
  name: joi.string().min(1).required(),
  phone: joi
    .string()
    .pattern(/[0-9]{10,11}/)
    .max(11)
    .required(),
  cpf: joi
    .string()
    .pattern(/[0-9]{11}/)
    .max(11)
    .required(),
  birthday: joi.date().required(),
});

export async function getCustomers(req, res) {
  let cpf = req.query.cpf;

  try {
    if (cpf) {
      cpf += "%";
      connection
        .query("SELECT * FROM customers WHERE cpf LIKE $1", [cpf])
        .then((games) => {
          res.send(games.rows);
        });
    } else {
      connection.query("SELECT * FROM customers").then((games) => {
        res.send(games.rows);
      });
    }
  } catch {
    res.sendStatus(500);
  }
}
export async function getCustomerId(req, res) {
  const { id } = req.params;
  connection
    .query("SELECT * FROM customers WHERE id=$1", [id])
    .then((games) => {
      res.send(games.rows[0]);
    });
}
export async function postCustomer(req, res) {
  const customer = req.body;
  console.log(customer);
  try {
    const validateCustomer = await customerSchema.validateAsync(req.body);
    let cpf = await connection.query(
      `
     SELECT * FROM customers WHERE cpf = $1
      `,
      [customer.cpf]
    );
    console.log(cpf);
    if (cpf.rowCount > 0) return res.sendStatus(409);
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
  } catch (error) {
    if (error.isJoi) {
      return res.sendStatus(400);
    }
    res.sendStatus(500);
  }
}
export async function editCustomer(req, res) {
  console.log(req.body);
  const customer = req.body;
  const { id } = req.params;
  console.log(id);

  try {
    const validateCustomer = await customerSchema.validateAsync(req.body);
    let customerCpf = (
      await connection.query(
        `
     SELECT customers.cpf FROM customers WHERE id=$1 
      `,
        [id]
      )
    ).rows[0];
    if (customerCpf.cpf === customer.cpf) {
      console.log("igual");
      connection
        .query(
          `
       UPDATE customers SET name=$1,phone=$2,cpf=$3,birthday=$4 WHERE id=$5`,
          [customer.name, customer.phone, customer.cpf, customer.birthday, id]
        )
        .then(() => {
          return res.sendStatus(200);
        });
      return;
    }
    let cpf = await connection.query(
      `
       SELECT customers.cpf FROM customers WHERE cpf=$1
        `,
      [customer.cpf]
    );
    console.log("cpf", cpf);
    if (cpf.rowCount > 0) return res.sendStatus(409);
    connection
      .query(
        `
       UPDATE customers SET name=$1,phone=$2,cpf=$3,birthday=$4 WHERE id=$5`,
        [customer.name, customer.phone, customer.cpf, customer.birthday, id]
      )
      .then(() => {
        return res.sendStatus(200);
      });
  } catch (error) {
    if (error.isJoi) {
      return res.sendStatus(400);
    }
    res.sendStatus(500);
  }
}
