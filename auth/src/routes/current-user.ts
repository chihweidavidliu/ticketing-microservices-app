import { Router } from "express";
import { validateUser } from "../middlewares/user-validator";
import { currentUser } from "../middlewares/current-user";

const currentUserRouter = Router();

currentUserRouter.get(
  "/api/users/currentuser",
  currentUser,
  validateUser,
  (req, res) => {
    return res.send({ currentUser: req.currentUser });
  }
);

export { currentUserRouter };
