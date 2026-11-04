import { prisma, pool } from "./prisma";
import { logger } from "../utils/logger";

export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Failed to connect to database", error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    await pool.end();
    logger.info("Database disconnected successfully");
  } catch (error) {
    logger.error("Error during database disconnection", error);
  }
};

