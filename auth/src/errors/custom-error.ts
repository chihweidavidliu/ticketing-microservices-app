export abstract class CustomError extends Error {
  abstract statusCode: number;
  constructor(message: string) {
    // even though we will not rely on the default error message string, it is still useful for logging purposes so allow passing of default message string in CustomErros
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract toApiErrors(): { message: string; field?: string }[];
}
