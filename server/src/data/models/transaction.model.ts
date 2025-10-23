import { DataTypes, Model } from "sequelize";
import { db } from "../db.ts";

interface TransactionAttributes {
  id: number;
}

interface TransactionCreationAttributes extends Omit<TransactionAttributes, "id"> {}

class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    }
  },
  {
    tableName: "Transaction",
    sequelize: db.sequelize,
  }
);

export default Transaction;
