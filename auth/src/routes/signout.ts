import { Router } from "express";
import { requireAuth } from "@dlticketbuddy/common";
import { currentUser } from "@dlticketbuddy/common";

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
