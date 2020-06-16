import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);
});

it("returns 400 if invalid email was used", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test", password: "password" })
    .expect(400);
});

it("returns 400 if invalid password was used", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "1" })
    .expect(400);
});

it("returns 400 if a field is missing", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ password: "hello" })
    .expect(400);

  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com" })
    .expect(400);
});

it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(400);
});

it("sets a cookie after a successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);

  expect(response.get("Set-Cookie")).toBeDefined();
});
