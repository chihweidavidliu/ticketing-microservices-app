import jwt from "jsonwebtoken";

export const createToken = (id: string, email: string) => {
  const userJwt = jwt.sign({ id, email }, process.env.JWT_KEY!);
  return userJwt;
};
