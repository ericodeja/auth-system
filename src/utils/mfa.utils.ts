import speakeasy from "speakeasy";
import qrcode from "qrcode";
import type { GeneratedSecret } from "speakeasy";
import HttpError from "./http-error.utils";

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
}

export default new MFAUtils();
