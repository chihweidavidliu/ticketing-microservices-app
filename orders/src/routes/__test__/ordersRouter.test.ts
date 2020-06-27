import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { signin } from "../../test/authHelper";
import { Ticket } from "../../models/ticket";
import { OrderStatus } from "@dlticketbuddy/common";
import { Order } from "../../models/order";
import { natsWrapper } from "../../events/nats-wrapper";

const createTicket = async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({ id, title: "concert1", price: 1000 });
  await ticket.save();
  return ticket;
};
const orderTicket = async (ticketId: string, cookie: string[]) => {
  // make the order
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId })
    .expect(201);

  return response;
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
    const { body: orderOne } = await orderTicket(ticket2.id, userOneCookie);
    const { body: orderTwo } = await orderTicket(ticket3.id, userOneCookie);

    // fetch orders for user one
    const response = await request(app)
      .get("/api/orders")
      .set("Cookie", userOneCookie)
      .send()
      .expect(200);

    expect(response.body.length).toEqual(2);

    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[0].ticket.id).toEqual(ticket2.id);

    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticket3.id);
  });
});

describe("GET /api/orders/:orderId", () => {
  it("should return 401 if the user is not signed in", async () => {
    const userOne = new mongoose.Types.ObjectId().toHexString();
    const cookie = await signin(userOne);
    const ticket = await createTicket();
    const { body: orderOne } = await orderTicket(ticket.id, cookie);

    await request(app).get(`/api/orders/${orderOne.id}`).send().expect(401);
  });

  it("should return 404 if the order does not exist", async () => {
    const userOne = new mongoose.Types.ObjectId().toHexString();
    const cookie = await signin(userOne);

    const nonExistentId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .get(`/api/orders/${nonExistentId}`)
      .set("Cookie", cookie)
      .send()
      .expect(404);
  });

  it("should return 401 if the order does not belong to current user", async () => {
    const userOne = new mongoose.Types.ObjectId().toHexString();
    const userTwo = new mongoose.Types.ObjectId().toHexString();

    // user one creates the order
    const cookie = await signin(userOne);
    const ticket = await createTicket();
    const { body: orderOne } = await orderTicket(ticket.id, cookie);

    // user two signs in and tries to get the order
    const userTwoCookie = await signin(userTwo);

    await request(app)
      .get(`/api/orders/${orderOne.id}`)
      .set("Cookie", userTwoCookie)
      .send()
      .expect(401);
  });

  it("should return 200 if valid details provided", async () => {
    const userOne = new mongoose.Types.ObjectId().toHexString();
    const cookie = await signin(userOne);
    const ticket = await createTicket();
    const { body: orderOne } = await orderTicket(ticket.id, cookie);

    await request(app)
      .get(`/api/orders/${orderOne.id}`)
      .set("Cookie", cookie)
      .send()
      .expect(200);
  });
});

describe("DELETE /api/orders/:orderId", () => {
  it("should return 401 if the user is not signed in", async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    await request(app).delete(`/api/orders/${orderId}`).send().expect(401);
  });

  it("should return 401 if the order does not belong to current user", async () => {
    const userOne = new mongoose.Types.ObjectId().toHexString();
    const userTwo = new mongoose.Types.ObjectId().toHexString();

    // user one creates the order
    const cookie = await signin(userOne);
    const ticket = await createTicket();
    const { body: orderOne } = await orderTicket(ticket.id, cookie);

    // user two signs in and tries to get the order
    const userTwoCookie = await signin(userTwo);

    await request(app)
      .delete(`/api/orders/${orderOne.id}`)
      .set("Cookie", userTwoCookie)
      .send()
      .expect(401);
  });

  it("should return 204 and update the status to cancelled", async () => {
    const cookie = await signin();
    const ticket = await createTicket();
    const { body: order } = await orderTicket(ticket.id, cookie);

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", cookie)
      .send()
      .expect(204);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
  });

  it("should publish an event after order cancellation", async () => {
    const cookie = await signin();
    const ticket = await createTicket();
    const { body: order } = await orderTicket(ticket.id, cookie);

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", cookie)
      .send()
      .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
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
    const ticket = await createTicket();

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
    const ticket = await createTicket();

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

  it("publichses an event after order creation", async () => {
    const cookie = await signin();
    const ticket = await createTicket();

    // check no order for the ticket has been created yet
    let order = await Order.findOne({ ticket: ticket.id });
    expect(order).toBeFalsy();

    await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .send({ ticketId: ticket.id })
      .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
