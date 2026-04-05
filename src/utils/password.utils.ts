import crypto from "crypto";
import axios from "axios";
import bcrypt from "bcrypt";
import config from "../config/config";
import HttpError from "./http-error.utils";

export type PasswordBreachResult = {
  breach: boolean;
  count: number;
};

const SALT_ROUNDS = config.saltRounds;

class PasswordUtils {
  async isPasswordBreached(
    plainTextPassword: string,
  ): Promise<PasswordBreachResult> {
    try {
      const sha1Hash = crypto
        .createHash("sha1")
        .update(plainTextPassword)
        .digest("hex")
        .toUpperCase();

      const prefix: string = sha1Hash.slice(0, 5); //To be sent to the api
      const suffix: string = sha1Hash.slice(5); //To be used for comparison

      const response = await axios.get<string>(
        `https://api.pwnedpasswords.com/range/${prefix}`,
        {
          headers: { "Add-Padding": true },
        },
      );

      const lines: string[] = response.data.split("\n"); // breaks the response into different lines

      for (const line of lines) {
        const [returnedSuffix, count] = line.split(":");

        if (!returnedSuffix || !count) {
          continue;
        }

        if (returnedSuffix.trim() === suffix) {
          return {
            breach: true,
            count: parseInt(count.trim(), 10), //how many times it appeared in breaches
          };
        }
      }
      return { breach: false, count: 0 };
    } catch (err) {
      throw new HttpError(502, `Password breach check failed: ${String(err)}`);
    }
  }

  async hashPassword(plainTextPassword: string) {
    return await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
  }

  async comparePassword(plainTextPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }
}

export default new PasswordUtils();
