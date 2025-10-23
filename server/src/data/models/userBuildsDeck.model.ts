import { DataTypes, Model } from "sequelize";
import { db } from "../db.ts";

interface UserBuildsDeckAttributes {
  id: number;
}

interface UserBuildsDeckCreationAttributes extends Omit<UserBuildsDeckAttributes, "id"> {}

class UserBuildsDeck extends Model<UserBuildsDeckAttributes, UserBuildsDeckCreationAttributes> implements UserBuildsDeckAttributes {
  public id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserBuildsDeck.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    }
  },
  {
    tableName: "UserBuildsDeck",
    sequelize: db.sequelize,
  }
);

export default UserBuildsDeck;
