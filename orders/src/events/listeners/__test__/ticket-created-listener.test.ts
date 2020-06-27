import { TicketCreatedListener } from "../ticket-created-listener";
import { TicketCreatedEvent } from "@dlticketbuddy/common";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // create an instance of the listener (using out mock natswrapper client - the mock was set up in jest setup file)
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create a fake event data object
  const data: TicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { data, listener, message };
};

it("creates and saves a ticket", async () => {
  const { data, listener, message } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, message);

  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket?.title).toEqual(data.title);
  expect(ticket?.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { data, listener, message } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});
