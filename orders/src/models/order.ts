import mongoose, { Schema, Model, Document } from "mongoose";
import { OrderStatus } from "@dlticketbuddy/common";
import { TicketDocument } from "./ticket";

interface OrderAttributes {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDocument;
}

interface OrderDocument extends Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDocument;
}

interface OrderModel extends Model<OrderDocument> {
  build(attributed: OrderAttributes): OrderDocument;
}

const OrderSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
      versionKey: false, // remove __v property
    },
  }
);

OrderSchema.statics.build = (attributes: OrderAttributes) => {
  const { userId, status, expiresAt, ticket } = attributes;
  return new Order({ userId, status, expiresAt, ticket: ticket._id });
};

const Order = mongoose.model<OrderDocument, OrderModel>("Order", OrderSchema);

export { Order, OrderAttributes };
