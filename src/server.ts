import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./infrastructure/config/database";
import { logger } from "./infrastructure/logger/logger";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

startServer();
