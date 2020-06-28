import { OrderCreatedEvent, OrderStatus } from "@dlticketbuddy/common";
import mongoose from "mongoose";
import { OrderCreatedListener } from "../OrderCreatedListener";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { Message } from "node-nats-streaming";

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const userId = new mongoose.Types.ObjectId().toHexString();

  // create and save a ticket
  const ticket = Ticket.build({ title: "concert", price: 100, userId });
  await ticket.save();

  // create a fake event data object
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRATION_WINDOW_SECONDS);

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: expiresAt.toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // fake message
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, message };
};

it("updates the ticket with the orderId", async () => {
  const { listener, ticket, data, message } = await setup();

  expect(ticket.orderId).not.toBeDefined();

  await listener.onMessage(data, message);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket?.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, data, ticket, message } = await setup();

  await listener.onMessage(data, message);

  // check ticket updated event payload was correct
  const payload = {
    id: ticket.id,
    version: ticket.version + 1,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId,
    orderId: data.id,
  };

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1] // gets the first call [0] and the second argument [1]
  );

  expect(ticketUpdatedData).toEqual(payload);
});
