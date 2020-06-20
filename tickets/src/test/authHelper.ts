import request from "supertest";
import { app } from "../app";
// sets up authenticated test requests

export const signin = async () => {
  const email = "test@test.com";
  const password = "password";

  const response = await request(app)
    .post("/api/users/signup")
    .send({ email, password })
    .expect(201);

  // set cookie
  const cookie = response.get("Set-Cookie");
  return { cookie, user: { email, password } };
};
