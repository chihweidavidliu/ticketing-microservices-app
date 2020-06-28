import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

import { OrderCancelledListener } from "../OrderCancelledListener";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCancelledEvent } from "@dlticketbuddy/common";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const userId = new mongoose.Types.ObjectId().toHexString();

  // create and save a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 100,
    userId,
  });

  await ticket.save();
  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, orderId, message };
};

it("removes orderId from ticket", async () => {
  const { listener, ticket, data, message } = await setup();

  await listener.onMessage(data, message);
  const updatedTicket = await Ticket.findById(ticket);
  expect(updatedTicket?.orderId).not.toBeDefined();
});

it("acks the message", async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, ticket, data, message } = await setup();

  await listener.onMessage(data, message);
  const updatedTicket = await Ticket.findById(ticket);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const ticketUpdatedPayload = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1] // gets the first call [0] and the second argument [1]
  );

  expect(ticketUpdatedPayload).toEqual({
    id: updatedTicket?.id,
    version: updatedTicket?.version,
    title: updatedTicket?.title,
    price: updatedTicket?.price,
    userId: updatedTicket?.userId,
    orderId: updatedTicket?.orderId,
  });
});
