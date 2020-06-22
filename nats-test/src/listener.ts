import nats, { Message, Stan } from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./events/ticket-created-listener";

console.clear();

const clientId = randomBytes(4).toString("hex");

const stan = nats.connect("ticketing", clientId, {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  // add graceful client shutdown event handler
  stan.on("close", () => {
    console.log("NATS connection closed!");
    // end process
    process.exit();
  });

  console.log("Listener connected to NATS streaming server");

  // subscribe to channels here

  new TicketCreatedListener(stan).listen();

  // BASIC WAY OF CREATING A SUBSCRIPTION (but for ease of use we have created a Listener abstract class and subclasses to implement subscriptions more easily)

  // const options = stan
  //   .subscriptionOptions()
  //   .setDeliverAllAvailable()
  //   .setManualAckMode(true) // force manual ack rather than assuming events are processed correctly
  //   .setAckWait(5 * 1000)
  //   .setDurableName('orders-service');

  // subscribe to the ticket: created channel
  // const subscription = stan.subscribe(
  //   "ticket:created",
  //   "orders-service-queue-group", // specify a queue group if you want to share work across multiple instances of the same app rather than having all of them process all incoming events concurrently
  //   options
  // );
  // subscription.on("message", (msg: Message) => {
  //   const data = msg.getData();
  //   if (typeof data === "string") {
  //     const result = JSON.parse(data);
  //     console.log(`Received event ${msg.getSequence()}`, result);
  //   }

  //   // manually acknowledge the message was processed
  //   msg.ack();
  // });
});

// intercept termination requests and close connection to the NATS streaming server
process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
