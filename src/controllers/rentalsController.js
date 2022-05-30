import connection from "../db.js";
import dayjs from "dayjs";

export async function postRental(req, res) {
  const rental = req.body;
  const date = dayjs().format("YYYY-MM-DD");
  try {
    if (rental.daysRented <= 0) return res.sendStatus(400);
    const customer = await connection.query(
      `
        SELECT * FROM customers WHERE id = $1
  `,
      [rental.customerId]
    );
    if (customer.rowCount <= 0) return res.sendStatus(400);
    const game = await connection.query(
      `
    SELECT * FROM games WHERE id = $1
  `,
      [rental.customerId]
    );
    if (game.rowCount <= 0) return res.sendStatus(400);
    const originalPrice =
      (await (
        await connection.query(
          `SELECT games."pricePerDay" FROM games WHERE id=$1`,
          [rental.gameId]
        )
      ).rows[0].pricePerDay) * rental.daysRented;
    connection
      .query(
        `
     INSERT INTO rentals ("customerId","gameId","daysRented","rentDate","originalPrice")
     VALUES ($1,$2,$3,$4,$5)`,
        [
          rental.customerId,
          rental.gameId,
          rental.daysRented,
          date,
          originalPrice,
        ]
      )
      .then(() => {
        res.sendStatus(201);
      });
  } catch (error) {
    res.sendStatus(500);
  }
}

export async function getRentals(req, res) {
  const customerId = req.query.customerId;
  const gameId = req.query.gameId;

  try {
    if (customerId) {
      const rentalsResult = await connection.query(
        `
      SELECT rentals.*, customers.name as "customerName", categories.name as "categoryName",games."categoryId",games.name as "gameName" 
      FROM rentals 
      JOIN customers 
        ON rentals."customerId"=customers.id 
      JOIN categories 
        ON rentals."gameId"=categories.id
      JOIN games 
        ON rentals."gameId"=games.id
      WHERE customers.id = $1`,
        [customerId]
      );
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
      return res.send(rentals);
    } else if (gameId) {
      const rentalsResult = await connection.query(
        `
    SELECT rentals.*, customers.name as "customerName", categories.name as "categoryName",games."categoryId",games.name as "gameName" 
    FROM rentals 
    JOIN customers 
      ON rentals."customerId"=customers.id 
    JOIN categories 
      ON rentals."gameId"=categories.id
    JOIN games 
      ON rentals."gameId"=games.id
      WHERE games.id = $1`,
        [gameId]
      );
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
      return res.send(rentals);
    } else {
      const rentalsResult = await connection.query(`
      SELECT rentals.*, customers.name as "customerName", categories.name as "categoryName",games."categoryId",games.name as "gameName" 
      FROM rentals 
      JOIN customers 
        ON rentals."customerId"=customers.id 
      JOIN categories 
        ON rentals."gameId"=categories.id
      JOIN games 
        ON rentals."gameId"=games.id
    `);
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
      return res.send(rentals);
    }
  } catch (error) {
    res.sendStatus(500);
  }
}

export async function returnRental(req, res) {
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
}

export async function deleteRental(req, res) {
  const { id } = req.params;
  const rental = (
    await connection.query(`SELECT * FROM rentals WHERE id=$1`, [id])
  ).rows;
  if (!rental) return res.sendStatus(404);
  if (rental.returnDate) return res.sendStatus(400);
  await connection.query(`DELETE FROM rentals WHERE id=$1`, [id]);
  res.sendStatus(200);
}
