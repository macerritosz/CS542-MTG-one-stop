import { DataTypes, Model } from "sequelize";
import { db } from "../db.ts";

interface ComboAttributes {
  id: number;
}

interface ComboCreationAttributes extends Omit<ComboAttributes, "id"> {}

class Combo extends Model<ComboAttributes, ComboCreationAttributes> implements ComboAttributes {
  public id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Combo.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    }
  },
  {
    tableName: "Combo",
    sequelize: db.sequelize,
  }
);

export default Combo;
