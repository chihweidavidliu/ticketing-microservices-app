import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from "@dlticketbuddy/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
