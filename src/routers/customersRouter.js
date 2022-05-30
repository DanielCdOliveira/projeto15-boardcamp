import { Router } from "express";

import {
  getCustomers,
  getCustomerId,
  postCustomer,
  editCustomer,
} from "../controllers/customersController.js";

const customersRouter = Router();
customersRouter.get("/customers", getCustomers);
customersRouter.get("/customers/:id", getCustomerId);
customersRouter.post("/customers", postCustomer);
customersRouter.put("/customers/:id", editCustomer);

export default customersRouter;
