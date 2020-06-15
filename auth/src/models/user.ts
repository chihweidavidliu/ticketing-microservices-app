import mongoose, { Schema, Model, Document } from "mongoose";
import { PasswordManager } from "../services/password-manager";

// describes the attributes needed to construct a user
interface UserAttributes {
  email: string;
  password: string;
}

// describes the properties that a user document has
interface UserDocument extends UserAttributes, Document {}

// describes properties that a User Model has
interface UserModel extends Model<UserDocument> {
  build(attributes: UserAttributes): UserDocument;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    // define a toJSON function that will be called whenever the document is stringified (e.g. when we call res.send(user))
    // ret is the original attempt at stringifying the object
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
      versionKey: false, // remove __v property
    },
  }
);

// this method ensures we always provide the correct attributes before passing it to the User constructor
UserSchema.statics.build = (attributes: UserAttributes) => {
  return new User(attributes);
};

// hash password whenever it is set
UserSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashedPassword = await PasswordManager.toHash(this.get("password"));
    this.set("password", hashedPassword);
  }
  done();
});

const User = mongoose.model<UserDocument, UserModel>("User", UserSchema);

export { User, UserAttributes };
