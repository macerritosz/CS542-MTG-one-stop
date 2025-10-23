import { DataTypes, Model } from "sequelize";
import { db } from "../db.ts";

interface DeckAttributes {
  id: number;
}

interface DeckCreationAttributes extends Omit<DeckAttributes, "id"> {}

class Deck extends Model<DeckAttributes, DeckCreationAttributes> implements DeckAttributes {
  public id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Deck.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    }
  },
  {
    tableName: "deck",
    sequelize: db.sequelize,
  }
);

export default Deck;
