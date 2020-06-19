import { Router } from "express";
import { currentUser } from "@dlticketbuddy/common";

const currentUserRouter = Router();

currentUserRouter.get("/api/users/currentuser", currentUser, (req, res) => {
  return res.send({ currentUser: req.currentUser || null });
});

export { currentUserRouter };
