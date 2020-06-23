import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { signin } from "../../test/authHelper";
import { Ticket, TicketDocument } from "../../models/ticket";
import { OrderStatus } from "@dlticketbuddy/common";
import { Order } from "../../models/order";

const createTicket = async () => {
  const ticket = Ticket.build({ title: "concert1", price: 1000 });
  await ticket.save();
  return ticket;
};
const orderTicket = async (ticketId: string, cookie: string[]) => {
  // make the order
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId })
    .expect(201);
};

describe("GET /api/orders", () => {
  it("should return 401 if the user is not signed in", async () => {
    await request(app).get("/api/orders").send().expect(401);
  });

  it("should return orders for current user", async () => {
    // create two users and sign them in
    const userOne = new mongoose.Types.ObjectId().toHexString();
    const userTwo = new mongoose.Types.ObjectId().toHexString();

    const userOneCookie = await signin(userOne);

    const userTwoCookie = await signin(userTwo);

    // create tickets
    const ticket1 = await createTicket();
    const ticket2 = await createTicket();
    const ticket3 = await createTicket();

    // make the orders, one for the other user and one for our test user
    await orderTicket(ticket1.id, userTwoCookie);
    await orderTicket(ticket2.id, userOneCookie);
    await orderTicket(ticket3.id, userOneCookie);

    // fetch orders for user one
    const response = await request(app)
      .get("/api/orders")
      .set("Cookie", userOneCookie)
      .send()
      .expect(200);

    expect(response.body.length).toEqual(2);

    const order1 = response.body[0];
    expect(order1.ticket.id).toEqual(ticket2.id);

    const order2 = response.body[1];
    expect(order2.ticket.id).toEqual(ticket3.id);
  });
});

describe("POST /api/orders", () => {
  it("should return 401 if the user is not signed in", async () => {
    await request(app)
      .post("/api/orders")
      .send({ ticketId: "fw2f3f" })
      .expect(401);
  });

  it("should return 404 if the ticket does not exist", async () => {
    const cookie = await signin();

    await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .send({ ticketId: mongoose.Schema.Types.ObjectId })
      .expect(404);
  });

  it("returns an error if the ticket is already reserved", async () => {
    const cookie = await signin();
    const ticket = Ticket.build({ title: "concert", price: 1000 });

    await ticket.save();

    const order = Order.build({
      ticket,
      userId: "fwf3f3f3f3",
      status: OrderStatus.Created,
      expiresAt: new Date(),
    });

    await order.save();

    await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .send({ ticketId: ticket.id })
      .expect(400);
  });

  it("should return 201 and the order if ticket id is valid", async () => {
    const cookie = await signin();
    const ticket = Ticket.build({ title: "concert", price: 1000 });

    await ticket.save();

    // check no order for the ticket has been created yet
    let order = await Order.findOne({ ticket: ticket.id });
    expect(order).toBeFalsy();

    const response = await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .send({ ticketId: ticket.id })
      .expect(201);

    // check order has been created in db
    order = await Order.findOne({ ticket: ticket.id });
    expect(order).toBeTruthy();

    expect(response.body.ticket).toEqual(ticket.id);
    expect(response.body.status).toEqual(OrderStatus.Created);
    expect(response.body.expiresAt).toBeTruthy();
  });

  it.todo("emits an order created event");
});
