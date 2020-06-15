import express from "express";
// removes the need to call next() on async errors (can just throw)
import "express-async-errors";
import mongoose from "mongoose";
import cookieSession from "cookie-session";
import { json } from "body-parser";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";
import { DatabaseConnectionError } from "./errors/database-connection-error";

const app = express();

app.use(json());

// trust the ingress-nginx proxy
app.set("trust proxy", true);

app.use(
  cookieSession({
    signed: false, // don't encrypt as we are using jwts are already tamper resistant
    secure: true,
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all("*", (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to MongoDb");

    app.listen(3000, () => {
      console.log("Auth Service: listening on port 3000");
    });
  } catch (error) {
    console.log(error);
    throw new DatabaseConnectionError();
  }
};

start();
