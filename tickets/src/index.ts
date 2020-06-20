import mongoose from "mongoose";
import { DatabaseConnectionError } from "@dlticketbuddy/common";

// In this project we set up our express app in a separate file so that it can be used for testing without having already specified a port
import { app } from "./app";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  try {
    await mongoose.connect("mongodb://tickets-mongo-srv:27017/tickets", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to MongoDb");

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
