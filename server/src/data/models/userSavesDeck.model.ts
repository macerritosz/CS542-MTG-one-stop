import { DataTypes, Model } from "sequelize";
import { db } from "../db.ts";

interface UserSavesDeckAttributes {
  id: number;
}

interface UserSavesDeckCreationAttributes extends Omit<UserSavesDeckAttributes, "id"> {}

class UserSavesDeck extends Model<UserSavesDeckAttributes, UserSavesDeckCreationAttributes> implements UserSavesDeckAttributes {
  public id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserSavesDeck.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    }
  },
  {
    tableName: "UserSavesDeck",
    sequelize: db.sequelize,
  }
);

export default UserSavesDeck;
