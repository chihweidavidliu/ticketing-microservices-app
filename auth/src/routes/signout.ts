import { Router } from "express";
import { validateUser } from "../middlewares/user-validator";
import { currentUser } from "../middlewares/current-user";

const signoutRouter = Router();

signoutRouter.post(
  "/api/users/signout",
  currentUser,
  validateUser,
  (req, res) => {
    delete req.currentUser;
    req.session = null;
    res.send({});
  }
);

export { signoutRouter };
