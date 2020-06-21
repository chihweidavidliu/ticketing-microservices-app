import mongoose, { Schema, Model, Document } from "mongoose";

interface TicketAttributes {
  title: string;
  price: number;
  userId: string;
}

interface TicketDocument extends TicketAttributes, Document {}

interface TicketModel extends Model<TicketDocument> {
  build(attributes: TicketAttributes): TicketDocument;
}

const TicketSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    userId: { type: String, required: true },
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

const Ticket = mongoose.model<TicketDocument, TicketModel>(
  "Ticket",
  TicketSchema
);

export { Ticket, TicketAttributes };
