import { Request, Response } from "express";
import { sendContactEmail } from "../services/email.service";

export async function submitContact(req: Request, res: Response) {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Basic validation
    if (typeof name !== "string" || typeof email !== "string" || typeof subject !== "string" || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const result = await sendContactEmail({ name, email, subject, message });
    return res.status(200).json({ ok: true, id: result.id });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
}