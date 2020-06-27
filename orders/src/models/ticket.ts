import mongoose, { Schema, Model, Document } from "mongoose";
import { OrderStatus } from "@dlticketbuddy/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Order } from "./order";

interface TicketAttributes {
  id: string;
  title: string;
  price: number;
}

interface TicketDocument extends Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>; // custom method to work out if a ticket has been reserved
  version: number;
}

interface TicketModel extends Model<TicketDocument> {
  build(attributes: TicketAttributes): TicketDocument;
  findLastVersion(event: {
    id: string;
    version: number;
  }): Promise<TicketDocument | null>;
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

// set up versioning to combat concurrency issues
TicketSchema.set("versionKey", "version"); // use custom 'version' field instead of __v to track version
TicketSchema.plugin(updateIfCurrentPlugin);

TicketSchema.statics.build = ({ id, ...otherAttributes }: TicketAttributes) => {
  return new Ticket({ _id: id, ...otherAttributes });
};

// custom method to find the last version of a ticket
TicketSchema.statics.findLastVersion = (event: {
  id: string;
  version: number;
}) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
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
