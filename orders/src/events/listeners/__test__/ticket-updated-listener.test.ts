import mongoose from "mongoose";
import { TicketUpdatedEvent } from "@dlticketbuddy/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a ticket

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 120,
  });

  await ticket.save();

  // create a fake data object
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "updated",
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // create a fake message object
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  // return all of this stuff
  return { listener, ticket, data, message };
};

it("updates a ticket", async () => {
  const { listener, ticket, data, message } = await setup();

  await listener.onMessage(data, message);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket?.version).toEqual(ticket.version + 1);
  expect(updatedTicket?.title).toEqual(data.title);
  expect(updatedTicket?.price).toEqual(data.price);
});

it("does not update a ticket if the event has invalid version", async (done) => {
  const { listener, ticket, data, message } = await setup();

  const newData: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: data.version + 1, // this version number is too high for the currently saved ticket
    title: "updated",
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  try {
    await listener.onMessage(newData, message);
  } catch (error) {
    // expect an error to be thrown and exit test
    expect(message.ack).not.toHaveBeenCalled();
    return done();
  }

  throw new Error("This should not show");
});

it("acks the message", async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});
