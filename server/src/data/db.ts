import { Sequelize } from "sequelize";
import dbConfig from "../config/db.config.ts";

const sequelize = new Sequelize(dbConfig.DB!, dbConfig.USER!, dbConfig.PASSWORD!, {
    host: dbConfig.HOST!,
    dialect: dbConfig.dialect as any,
  });

export const db = {
  Sequelize,
  sequelize,
};