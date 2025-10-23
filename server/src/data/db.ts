import { Sequelize } from "sequelize";
import dbConfig from "../config/db.config.ts";


const sequelize = new Sequelize(dbConfig.DB!, dbConfig.USER!, dbConfig.PASSWORD!, {
    host: dbConfig.HOST!,
    dialect: dbConfig.dialect as any,
  });


  sequelize.authenticate()
  .then(() => console.log("✅ Database connected successfully!"))
  .catch((err: unknown) => console.error("❌ Database connection failed:", err));

export const db = {
  Sequelize,
  sequelize,
};