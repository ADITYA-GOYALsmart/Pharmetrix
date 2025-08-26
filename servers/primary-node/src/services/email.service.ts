import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { NotificationType } from "../mongodb/schematics/Notifications";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_MAIL,
    pass: process.env.MAIL_PASS,
  },
});

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}