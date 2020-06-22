import mongoose from "mongoose";
import { DatabaseConnectionError } from "@dlticketbuddy/common";

// In this project we set up our express app in a separate file so that it can be used for testing without having already specified a port
import { app } from "./app";
import { natsWrapper } from "./events/nats-wrapper";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  await natsWrapper.connect("ticketing", "wfw3f3", "http://nats-srv:4222");

  natsWrapper.client.on("close", () => {
    console.log("NATS connection closed!");
    // end process
    process.exit();
  });

  // intercept termination requests and close connection to the NATS streaming server
  process.on("SIGINT", () => natsWrapper.client.close());
  process.on("SIGTERM", () => natsWrapper.client.close());

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log(`Connected to MongoDb at ${process.env.MONGO_URI}`);

    // start up our server
    app.listen(3000, () => {
      console.log("Ticket Service: listening on port 3000");
    });
  } catch (error) {
    console.log(error);
    throw new DatabaseConnectionError();
  }
};

start();
