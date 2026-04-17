import speakeasy from "speakeasy";
import qrcode from "qrcode";
import type { GeneratedSecret } from "speakeasy";
import HttpError from "./http-error.utils";
import crypto from "crypto";
import config from "../config/config";

class MFAUtils {
  generateSecret(email: string) {
    try {
      const secret = speakeasy.generateSecret({
        length: 30,
        name: `Auth-System: ${email}`,
      });
      return secret;
    } catch (err) {
      throw new HttpError(500, `${err}`);
    }
  }

  async getOtpAuthUrl(secret: GeneratedSecret) {
    if (secret.otpauth_url) {
      const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
      return qrCodeDataUrl;
    }

    throw new HttpError(400, "Invalid Secret");
  }

  verifyToken(secret: string, token: string) {
    try {
      const isTokenValid = speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: token,
        window: 6,
      });

      return isTokenValid;
    } catch (err) {
      throw new HttpError(401, "Invalid token");
    }
  }

  encrypt(text: string) {
    try {
      const iv = crypto.randomBytes(config.ivBytes);
      const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        Buffer.from(config.mfaEncryptionSecret),
        iv,
      );
      const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
      return iv.toString("hex") + ":" + encrypted.toString("hex"); // store iv alongside
    } catch (err) {
      throw new HttpError(500, String(err));
    }
  }

  decrypt(text: string) {
    try {
      const [ivHex, encryptedHex] = text.split(":");
      const iv = Buffer.from(ivHex as string, "hex");
      const encrypted = Buffer.from(encryptedHex as string, "hex");
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(config.mfaEncryptionSecret),
        iv,
      );
      return Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]).toString();
    } catch (err) {
      throw new HttpError(500, String(err));
    }
  }
}

export default new MFAUtils();
