import mongoose, { Schema, Model, Document } from "mongoose";
import { OrderStatus } from "@dlticketbuddy/common";
import { Order } from "./order";

interface TicketAttributes {
  title: string;
  price: number;
}

interface TicketDocument extends Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>; // custom method to work out if a ticket has been reserved
}

interface TicketModel extends Model<TicketDocument> {
  build(attributes: TicketAttributes): TicketDocument;
}

const TicketSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
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

TicketSchema.statics.build = (attributes: TicketAttributes) => {
  return new Ticket(attributes);
};
// don't use an arrow function (will lose this binding)
TicketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this._id,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDocument, TicketModel>(
  "Ticket",
  TicketSchema
);

export { Ticket, TicketDocument, TicketAttributes };
