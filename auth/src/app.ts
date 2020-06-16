import express from "express";
// removes the need to call next() on async errors (can just throw)
import "express-async-errors";
import cookieSession from "cookie-session";
import { json } from "body-parser";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

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

export { app };
