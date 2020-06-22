import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";
console.clear();

// create client to connect to streaming server (often referred to as stan)
// the clusterId (first argument) was specified in args array in out k8s deployment config for the server
const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", async () => {
  console.log("Publisher connected to NATS streaming server");

  const data = { id: "123", title: "concert", price: 20 };

  // custom publishing implementation with better type checking
  const ticketCreatedPublisher = new TicketCreatedPublisher(stan);
  await ticketCreatedPublisher.publish(data);

  // BASIC WAY OF PUBLISHING

  //   const data = JSON.stringify({ id: "123", title: "concert", price: 20 });

  // stan.publish("ticket:created", data, () => {
  //   console.log("Event published");
  // });
});
