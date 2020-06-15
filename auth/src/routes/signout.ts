import { Router } from "express";
import { requireAuth } from "../middlewares/require-auth";
import { currentUser } from "../middlewares/current-user";

const signoutRouter = Router();

signoutRouter.post(
  "/api/users/signout",
  currentUser,
  requireAuth,
  (req, res) => {
    delete req.currentUser;
    req.session = null;
    res.send({});
  }
);

export { signoutRouter };
