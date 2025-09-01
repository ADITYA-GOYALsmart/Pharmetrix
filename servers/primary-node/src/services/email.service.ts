import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_MAIL,
    pass: process.env.MAIL_PASS,
  },
});

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function sendContactEmail(payload: ContactPayload) {
  const { name, email, subject, message } = payload;

  if (!process.env.APP_MAIL) throw new Error("APP_MAIL not configured");

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111">
      <h2 style="margin:0 0 8px">New Contact Form Submission</h2>
      <p style="margin:0 0 16px;color:#444">From the Pharmetrix Landing Page</p>
      <hr style="border:none;border-top:1px solid #eee;margin:12px 0"/>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;background:#fafafa;border:1px solid #eee;border-radius:8px;padding:12px">${message}</pre>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      // Show the actual sender while keeping authenticated mailbox; use replyTo for responses
      from: `${name} <${process.env.APP_MAIL}>`,
      replyTo: email,
      to: process.env.APP_MAIL,
      subject: `[Pharmetrix Contact] ${subject}`,
      html,
      envelope: {
        from: process.env.APP_MAIL as string,
        to: process.env.APP_MAIL as string,
      },
      headers: {
        "X-Original-Sender": email,
      },
    });
    return { success: true, id: info.messageId };
  } catch (err) {
    throw new Error(`Failed to send contact email: ${getErrorMessage(err)}`);
  }
}