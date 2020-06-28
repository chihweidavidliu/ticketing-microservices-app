import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { signin } from "../../test/authHelper";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../events/nats-wrapper";

describe("POST /api/tickets", () => {
  it("has a route handler listening to /api/tickets for post requests", async () => {
    const response = await request(app).post("/api/tickets").send({});
    expect(response.status).not.toEqual(404);
  });

  it("can only be accessed if user is signed in", async () => {
    await request(app)
      .post("/api/tickets")
      .send({ title: "Hello", price: "10" })
      .expect(401);
  });

  it("returns a status other than 401 if the user is signed in", async () => {
    // signup
    const cookie = await signin();

    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({});

    expect(response.status).not.toEqual(401);
  });

  it("returns an error if an invalid title is provided", async () => {
    const cookie = await signin();

    await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({ title: "", price: "10" })
      .expect(400);
  });

  it("returns an error if an invalid price is provided", async () => {
    const cookie = await signin();

    await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({ title: "fwg3", price: "-10" })
      .expect(400);
  });

  it("creates a ticket and returns it with valid inputs", async () => {
    const cookie = await signin();

    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = "hello";
    const price = 20;

    await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({ title, price })
      .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(price);
  });

  it("publishes an event after creating a ticket", async () => {
    const cookie = await signin();

    const title = "hello";
    const price = 20;

    await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({ title, price })
      .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});

describe("GET /api/tickets/:id", () => {
  it("returns 404 if ticket is not found", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).get(`api/tickets/${id}`).send().expect(404);
  });

  it("returns 200 if ticket is found", async () => {
    const title = "Hello";
    const price = 120;
    const ticket = Ticket.build({ userId: "f2g3g", title, price });
    await ticket.save();

    const response = await request(app)
      .get(`/api/tickets/${ticket._id}`)
      .send()
      .expect(200);

    expect(response.body.title).toEqual(title);
    expect(response.body.price).toEqual(price);
  });
});

const createTicket = async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ title: "Hello", price: 120, userId: id });
  await ticket.save();
  return ticket;
};

describe("GET /api/tickets", () => {
  it("returns 200 and tickets array", async () => {
    await createTicket();
    await createTicket();
    const response = await request(app).get("/api/tickets").send().expect(200);
    expect(response.body.length).toEqual(2);
  });
});

describe("PUT /api/tickets/:id", () => {
  it("returns 401 if user is not logged in", async () => {
    const ticket = await createTicket();
    await request(app)
      .put(`/api/tickets/${ticket._id}`)
      .send({
        title: "new",
        price: 10,
      })
      .expect(401);
  });

  it("returns 404 if ticket is not found", async () => {
    const cookie = await signin();
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .set("Cookie", cookie)
      .send({
        title: "New Title",
        price: 1,
      })
      .expect(404);
  });

  it("returns 401 if the user does not own the ticket", async () => {
    const ticket = await createTicket();

    const differentId = new mongoose.Types.ObjectId().toHexString();
    const cookie = await signin(differentId);

    await request(app)
      .put(`/api/tickets/${ticket._id}`)
      .set("Cookie", cookie)
      .send({
        title: "new",
        price: 10,
      })
      .expect(401);
  });

  it("returns 200 and the updated ticket if input is valid", async () => {
    const ticket = await createTicket();
    const cookie = await signin(ticket.userId);

    const newTitle = "New Title";
    const newPrice = 10;

    const response = await request(app)
      .put(`/api/tickets/${ticket._id}`)
      .set("Cookie", cookie)
      .send({
        title: newTitle,
        price: newPrice,
      })
      .expect(200);

    expect(response.body.title).toEqual(newTitle);
    expect(response.body.price).toEqual(newPrice);

    const updatedTicket = await Ticket.findById(ticket._id);

    expect(updatedTicket?.title).toEqual(newTitle);
    expect(updatedTicket?.price).toEqual(newPrice);
  });

  it("publishes an event after updating a ticket", async () => {
    const ticket = await createTicket();
    const cookie = await signin(ticket.userId);

    const newTitle = "New Title";
    const newPrice = 10;

    await request(app)
      .put(`/api/tickets/${ticket._id}`)
      .set("Cookie", cookie)
      .send({
        title: newTitle,
        price: newPrice,
      })
      .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it("rejects updates if the ticket is reserved", async () => {
    const ticket = await createTicket();
    const cookie = await signin(ticket.userId);

    const newTitle = "New Title";
    const newPrice = 10;
    const orderId = new mongoose.Types.ObjectId().toHexString();

    ticket.set({ orderId });
    await ticket.save();

    await request(app)
      .put(`/api/tickets/${ticket._id}`)
      .set("Cookie", cookie)
      .send({
        title: newTitle,
        price: newPrice,
      })
      .expect(400);
  });

  it("returns 400 if input is invalid", async () => {
    const ticket = await createTicket();
    const cookie = await signin(ticket.userId);

    await request(app)
      .put(`/api/tickets/${ticket._id}`)
      .set("Cookie", cookie)
      .send({
        hello: "this field is not allowed",
      })
      .expect(400);
  });
});
