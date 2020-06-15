import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError {
  message = "Error connecting to database";
  statusCode = 500;
  constructor() {
    // CustomError (like Error) expects a default message property to be passed when instantiated
    // DatabaseConnectionError will just pass a default message for logging purposes, but for API responses will
    // rely on the array of type ValidationError[] from express-validator that we pass in when instantiating the DatabaseConnectionError
    super("Error connecting to database");
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  toApiErrors() {
    return [{ message: this.message }];
  }
}
