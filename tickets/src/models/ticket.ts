import mongoose, { Schema, Model, Document } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface TicketAttributes {
  title: string;
  price: number;
  userId: string;
}

interface TicketDocument extends Document {
  title: string;
  price: number;
  userId: string;
  version: number;
}

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

// set up versioning to combat concurrency issues
TicketSchema.set("versionKey", "version"); // use custom 'version' field instead of __v to track version
TicketSchema.plugin(updateIfCurrentPlugin);

TicketSchema.statics.build = (attributes: TicketAttributes) => {
  return new Ticket(attributes);
};

const Ticket = mongoose.model<TicketDocument, TicketModel>(
  "Ticket",
  TicketSchema
);

export { Ticket, TicketAttributes };
