import { Resend } from "resend";
import config from "../config/config";
import HttpError from "./http-error.utils";

const RESEND_API_KEY = config.resendApiKey;
const RESEND_DOMAIN = config.resendDomain;
const resend = new Resend(RESEND_API_KEY);

class SendEmail {
  sendEmailVerificationMail = async (
    email: string,
    emailVerificationToken: string,
  ) => {
    const { data, error } = await resend.emails.send({
      from: RESEND_DOMAIN,
      to: [email],
      subject: "Verify your email",
      html: `${config.baseUrl}/auth/verify-email/${emailVerificationToken}`,
    });

    if (error) {
      throw new HttpError(502, error.message);
    }
    return data;
  };
}

export default new SendEmail();
