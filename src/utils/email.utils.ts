import { Resend } from "resend";
import config from "../config/config";

const RESEND_API_KEY = config.resendApiKey;
if (!RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY");
}
const RESEND_DOMAIN = config.resendDomain;
if (!RESEND_DOMAIN) {
  throw new Error("Missing RESEND_DOMAIN");
}
const resend = new Resend(RESEND_API_KEY);

export const sendEmailVerificationMail = async (
  email: string,
  emailVerificationToken: string,
) => {
  const { data, error } = await resend.emails.send({
    from: RESEND_DOMAIN,
    to: [email],
    subject: "Verify your email",
    html: emailVerificationToken,
  });

  if (error) {
    throw new Error(error.message);
  }
  return data
};
