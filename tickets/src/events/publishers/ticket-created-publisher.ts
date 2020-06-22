import { Publisher, Subjects, TicketCreatedEvent } from "@dlticketbuddy/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
