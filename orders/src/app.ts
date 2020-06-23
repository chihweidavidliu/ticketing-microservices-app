import express from "express";
// removes the need to call next() on async errors (can just throw)
import "express-async-errors";
import cookieSession from "cookie-session";
import { json } from "body-parser";
import {
  NotFoundError,
  currentUser,
  errorHandler,
} from "@dlticketbuddy/common";
import { ordersRouter } from "./routes/ordersRouter";

const app = express();

app.use(json());

// trust the ingress-nginx proxy
app.set("trust proxy", true);

app.use(
  cookieSession({
    signed: false, // don't encrypt as we are using jwts are already tamper resistant
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(currentUser); // add current user to body
app.use(ordersRouter);

app.all("*", (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
