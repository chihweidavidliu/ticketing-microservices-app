import request from "supertest";
import { app } from "../../app";
import { signin } from "../../test/authHelper";

it("clears cookie after signing out", async () => {
  // signup
  const { cookie } = await signin();

  const response = await request(app)
    .post("/api/users/signout")
    .set("Cookie", cookie)
    .send({})
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
});
