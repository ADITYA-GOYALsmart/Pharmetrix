import { Request, Response, NextFunction } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Basic logger helpers
function logInfo(msg: string, ...args: any[]) { console.log(`[OTP] ${msg}`, ...args); }
function logWarn(msg: string, ...args: any[]) { console.warn(`[OTP] ${msg}`, ...args); }
function logError(msg: string, ...args: any[]) { console.error(`[OTP] ${msg}`, ...args); }

// In-memory OTP store: email -> { code, expiresAt }
const otpStore = new Map<string, { code: string; expiresAt: number }>();

function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

logInfo(
  `Controller loaded. ENV -> APP_MAIL set: ${!!process.env.APP_MAIL}, MAIL_PASS set: ${!!process.env.MAIL_PASS}, NODE_ENV: ${process.env.NODE_ENV}, PORT: ${process.env.PORT}`
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_MAIL,
    pass: process.env.MAIL_PASS,
  },
});

export const sendOtp = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { email } = req.body as { email?: string };
    const normalizedEmail = email ? email.trim().toLowerCase() : undefined;
    logInfo(`sendOtp called. email: ${normalizedEmail ?? "<missing>"}`);

    if (!normalizedEmail) {
      logWarn("sendOtp aborted: Email not provided");
      res.status(400).json({ message: "Email is required" });
      return;
    }

    if (!process.env.APP_MAIL) {
      logError("APP_MAIL not configured at runtime.");
      throw new Error("APP_MAIL not configured");
    }

    // Verify transporter configuration before sending
    try {
      await transporter.verify();
      logInfo("Nodemailer transporter verified successfully.");
    } catch (verifyErr: any) {
      logWarn("Nodemailer transporter verification failed:", verifyErr?.message || verifyErr);
    }

  const code = generate6DigitCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(normalizedEmail, { code, expiresAt });
  logInfo(`OTP generated and stored. email: ${normalizedEmail}, expiresAt: ${new Date(expiresAt).toISOString()}`);

    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111">
        <h2 style="margin:0 0 8px">Your Pharmetrix Verification Code</h2>
        <p>Use the following 6-digit code to verify your email address. This code expires in 10 minutes.</p>
        <div style="font-size:32px;font-weight:800;letter-spacing:8px;padding:12px 16px;border:1px solid #eee;border-radius:12px;display:inline-block;">${code}</div>
        <p style="color:#666;margin-top:12px">If you didn’t request this, you can safely ignore this email.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `Pharmetrix <${process.env.APP_MAIL}>`,
      to: email,
      subject: "Your Pharmetrix verification code",
      html,
      envelope: { from: process.env.APP_MAIL as string, to: email },
    });

    logInfo("OTP email dispatched successfully.");
    res.status(200).json({ message: "OTP sent" });
  } catch (err: any) {
    logError("sendOtp error:", err?.message || err);
    res.status(500).json({ message: err?.message || "Failed to send OTP" });
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { email, code } = req.body as { email?: string; code?: string };
    const normalizedEmail = email ? email.trim().toLowerCase() : undefined;
    logInfo(`verifyOtp called. email: ${normalizedEmail ?? "<missing>"}`);

    if (!normalizedEmail || !code) {
      logWarn("verifyOtp aborted: Email or code missing");
      res.status(400).json({ message: "Email and code are required" });
      return;
    }

    const record = otpStore.get(normalizedEmail);
    if (!record) {
      logWarn("verifyOtp: No OTP found for email", normalizedEmail);
      res.status(400).json({ message: "No OTP found for this email" });
      return;
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);
      logWarn("verifyOtp: OTP expired for email", normalizedEmail);
      res.status(400).json({ message: "OTP expired" });
      return;
    }

    if (record.code !== code) {
      logWarn("verifyOtp: Invalid OTP provided for email", normalizedEmail);
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    // Do NOT consume/delete the OTP here. keep it until the reset endpoint consumes it.
    logInfo("verifyOtp: OTP validated for email", normalizedEmail);
    res.status(200).json({ message: "OTP verified" });
  } catch (err: any) {
    logError("verifyOtp error:", err?.message || err);
    res.status(500).json({ message: err?.message || "Failed to verify OTP" });
  }
};

// Helper to verify OTP programmatically from other controllers.
// Throws an Error with a readable message when verification fails.
export async function verifyOtpRecord(email?: string, code?: string) {
  const normalizedEmail = email ? email.trim().toLowerCase() : undefined;
  if (!normalizedEmail || !code) {
    throw new Error("Email and code are required");
  }

  const record = otpStore.get(normalizedEmail);
  if (!record) {
    throw new Error("No OTP found for this email");
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    throw new Error("OTP expired");
  }

  if (record.code !== code) {
    throw new Error("Invalid OTP");
  }

  // Consume the OTP
  otpStore.delete(normalizedEmail);
  return true;
}