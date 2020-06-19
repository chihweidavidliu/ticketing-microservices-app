import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { BadRequestError, validateRequest } from "@dlticketbuddy/common";
import { User } from "../models/user";
import { PasswordManager } from "../services/password-manager";
import { createToken } from "../services/createToken";

const signinRouter = Router();

signinRouter.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError("Invalid Credentials");
    }

    const passwordMatches = await PasswordManager.compare(
      user.password,
      password
    );

    if (!passwordMatches) {
      throw new BadRequestError("Invalid Credentials");
    }

    const userJwt = createToken(user.id, user.email);

    // @ts-ignore
    req.session = {
      jwt: userJwt,
    };

    res.send(user);
  }
);

export { signinRouter };
