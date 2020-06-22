import { Publisher, Subjects, TicketUpdatedEvent } from "@dlticketbuddy/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
