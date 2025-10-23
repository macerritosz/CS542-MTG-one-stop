import { DataTypes, Model } from "sequelize";
import { db } from "../db.ts";

interface CardsInTransactionAttributes {
  id: number;
}

interface CardsInTransactionCreationAttributes extends Omit<CardsInTransactionAttributes, "id"> {}

class CardsInTransaction extends Model<CardsInTransactionAttributes, CardsInTransactionCreationAttributes> implements CardsInTransactionAttributes {
  public id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CardsInTransaction.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    }
  },
  {
    tableName: "CardsInTransaction",
    sequelize: db.sequelize,
  }
);

export default CardsInTransaction;
