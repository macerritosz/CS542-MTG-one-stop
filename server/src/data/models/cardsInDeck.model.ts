import { DataTypes, Model } from "sequelize";
import { db } from "../db.ts";

interface CardsInDeckAttributes {
  id: number;
}

interface CardsInDeckCreationAttributes extends Omit<CardsInDeckAttributes, "id"> {}

class CardsInDeck extends Model<CardsInDeckAttributes, CardsInDeckCreationAttributes> implements CardsInDeckAttributes {
  public id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CardsInDeck.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    }
  },
  {
    tableName: "CardsInDeck",
    sequelize: db.sequelize,
  }
);

export default CardsInDeck;
