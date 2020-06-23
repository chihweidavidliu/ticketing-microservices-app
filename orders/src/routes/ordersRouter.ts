import { Router, Request, Response } from "express";
import {
  requireAuth,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from "@dlticketbuddy/common";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";

const ordersRouter = Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

ordersRouter.get("/api/orders", requireAuth, async (req, res) => {
  const orders = await Order.find({ userId: req.currentUser!.id }).populate(
    "ticket"
  );
  res.send(orders);
});

ordersRouter.get("/api/orders/:orderId", async (req, res) => {
  res.send("orders");
});

ordersRouter.put("/api/orders/:orderId", async (req, res) => {
  res.send("orders");
});

ordersRouter.post(
  "/api/orders/",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided"),
  ],
  async (req: Request, res: Response) => {
    // Find the ticket the user is trying to order in the database
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure this ticket is not already reserved
    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }

    // calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });

    await order.save();

    // Publish an event saying that an order was created

    res.status(201).send(order);
  }
);

ordersRouter.delete("/api/orders/:orderId", async (req, res) => {
  res.send("orders");
});

export { ordersRouter };
