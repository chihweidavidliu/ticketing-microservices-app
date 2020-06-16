import request from "supertest";
import { app } from "../../app";
import { signin } from "../../test/authHelper";

it("returns 200 and current user if user is logged in", async () => {
  // signup
  const { cookie, user } = await signin();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual(user.email);
});

it("returns null if not logged in", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
