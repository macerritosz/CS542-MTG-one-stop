import { DataTypes, Model } from "sequelize";
import { db } from "../db.ts";

interface CardAttributes {
  id: number;
}

interface CardCreationAttributes extends Omit<CardAttributes, "id"> {}

class Card extends Model<CardAttributes, CardCreationAttributes> implements CardAttributes {
  public id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Card.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    }
  },
  {
    tableName: "card",
    sequelize: db.sequelize,
  }
);

export default Card;
