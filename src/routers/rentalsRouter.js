import { Router } from "express";

import {
  postRental,
  getRentals,
  returnRental,
  deleteRental,
} from "../controllers/rentalsController.js";
const rentalsRouter = Router();
rentalsRouter.post("/rentals", postRental);
rentalsRouter.get("/rentals", getRentals);
rentalsRouter.post("/rentals/:id/return", returnRental);
rentalsRouter.delete("/rentals/:id", deleteRental);

export default rentalsRouter;
