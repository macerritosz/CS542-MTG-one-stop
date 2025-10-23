import { DataTypes, Model } from "sequelize";
import { db } from "../db.ts";

interface CardsInComboAttributes {
  id: number;
}

interface CardsInComboCreationAttributes extends Omit<CardsInComboAttributes, "id"> {}

class CardsInCombo extends Model<CardsInComboAttributes, CardsInComboCreationAttributes> implements CardsInComboAttributes {
  public id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CardsInCombo.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    }
  },
  {
    tableName: "CardsInCombo",
    sequelize: db.sequelize,
  }
);

export default CardsInCombo;
