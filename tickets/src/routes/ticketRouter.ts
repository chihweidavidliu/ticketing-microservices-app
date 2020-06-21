import { Router, Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
} from "@dlticketbuddy/common";
import { Ticket } from "../models/ticket";

const ticketRouter = Router();

ticketRouter.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    // create new ticket
    const newTicket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });

    await newTicket.save();

    return res.status(201).send(newTicket);
  }
);

ticketRouter.get("/api/tickets", async (req: Request, res: Response) => {
  const tickets = await Ticket.find({});
  // TODO: filter out tickets that have been bought
  res.send(tickets);
});

ticketRouter.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const ticket = await Ticket.findById(id);

  if (!ticket) {
    throw new NotFoundError();
  }

  res.send(ticket);
});

ticketRouter.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title,
      price,
    });

    const updated = await ticket.save();

    res.send(updated);
  }
);

export { ticketRouter };
