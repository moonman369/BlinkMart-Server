import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

if (!process.env["APP_RESEND_API_KEY"]) {
  console.error("Unable to find property: `APP_RESEND_API_KEY` in .env file");
}

const resend = new Resend(process.env["APP_RESEND_API_KEY"]);

const sendEmail = async ({ to, subject, htmlBody }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "BlinkMart <admin@moonman.in>",
      to: [to],
      subject: subject,
      html: htmlBody,
    });
    if (error) {
      console.error(`Resend API Error: `, { error });
      return error;
    }
    console.log(data);
    return data;
  } catch (error) {}
};

export default sendEmail;
