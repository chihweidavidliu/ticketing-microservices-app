import { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

// This abstract class will take a NATS streaming client that is connected to a streaming server and provide methods to add a listener very easily

// a generic interferface used to enforce coupling a certain NATS subject/channel and the data structure associated with it
// for each event type we will define an event interface that follows this shape
interface Event {
  subject: Subjects;
  data: any;
}

// pass Event as a type argument - when we create sub classes of listener, e.g. TicketCreatedListener we need to pass a TicketCreatedEvent interface
// that follows the shape of Event and tells the listener what the subject is and what the corresponding payload data looks like
export abstract class Listener<T extends Event> {
  abstract subject: T["subject"];
  abstract onMessage(data: T["data"], msg: Message): void;
  abstract queueGroupName: string;
  private client: Stan;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true) // force manual ack rather than assuming events are processed correctly
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    subscription.on("message", (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);
      const parsedData = this.parseMessage(msg);

      this.onMessage(parsedData, msg);
    });
  }

  // by default the message from the event bus will be time string or buffer - we need to convert the data to json
  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"));
  }
}
