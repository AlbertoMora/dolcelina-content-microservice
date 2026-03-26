import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface categoryAttributes {
  id: string;
  name: string;
  description?: string;
  creation_date?: Date;
}

export type categoryPk = "id";
export type categoryId = category[categoryPk];
export type categoryOptionalAttributes = "description" | "creation_date";
export type categoryCreationAttributes = Optional<categoryAttributes, categoryOptionalAttributes>;

export class category extends Model<categoryAttributes, categoryCreationAttributes> implements categoryAttributes {
  id!: string;
  name!: string;
  description?: string;
  creation_date?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof category {
    return category.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "name"
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'categories',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
    ]
  });
  }
}
