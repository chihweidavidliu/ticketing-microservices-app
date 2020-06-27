import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent } from "@dlticketbuddy/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketUpdatedEvent["data"], message: Message) {
    const { title, price } = data;

    // use custom method to find ticket by id AND previous version number
    const ticket = await Ticket.findLastVersion(data);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.set({ title, price });
    await ticket.save();

    message.ack();
  }
}
