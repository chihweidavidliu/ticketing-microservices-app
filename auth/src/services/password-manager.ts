import bcrypt from "bcrypt";

export class PasswordManager {
  static async toHash(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const result = await bcrypt.compare(suppliedPassword, storedPassword);
    return result;
  }
}
