import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { BadRequestError } from "@dlticketbuddy/common";
import { User } from "../models/user";
import { createToken } from "../services/createToken";
import { validateRequest } from "@dlticketbuddy/common";

const signupRouter = Router();

signupRouter.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // check email is not taken
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email in use");
    }

    // create a user and save (using our custom build method for type safety)
    // password will be hashed by Mongoose pre hook
    const user = User.build({ email, password });
    await user.save();

    const userJwt = createToken(user.id, user.email);
    // store jwt in session object
    // @ts-ignore
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { signupRouter };
