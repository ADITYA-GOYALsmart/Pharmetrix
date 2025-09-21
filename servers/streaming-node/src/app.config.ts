import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

export const corsConfig = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    const allowedOrigins = [
      `http://localhost:${process.env.CLIENT_PORT || 5173}`,
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5000",
      "https://thepharmetrix.netlify.app",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

export const backupPort = 9000;

export const jwtKey = process.env.JWT_SECRET as string;

export const generateISTTimestamp = (): string => {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};
