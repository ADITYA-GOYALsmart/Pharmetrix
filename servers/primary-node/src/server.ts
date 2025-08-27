import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router } from "./router";
import { connectMongoDB } from "./mongodb/mongodb.config";
import { backupPort, corsConfig } from "./app.config";
import { initializeExpiryScheduler } from "./controllers/scheduler.controller";

dotenv.config();

const app = express();
const PORT = process.env.PORT || backupPort;

import { attachRequestId } from "./middleware/requestid.middleware";
import { errorHandler } from "./middleware/error.middleware";

app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(attachRequestId);

app.use(router);
app.use(errorHandler);

connectMongoDB();

// Initialize daily expiry scheduler
initializeExpiryScheduler();

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
