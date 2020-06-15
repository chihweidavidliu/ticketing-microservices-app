import { Router } from "express";
import { requireAuth } from "../middlewares/require-auth";
import { currentUser } from "../middlewares/current-user";

const currentUserRouter = Router();

currentUserRouter.get(
  "/api/users/currentuser",
  currentUser,
  requireAuth,
  (req, res) => {
    return res.send({ currentUser: req.currentUser });
  }
);

export { currentUserRouter };
