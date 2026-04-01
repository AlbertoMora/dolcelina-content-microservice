import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { product, productId } from './product';

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

  // category hasMany product via category_id
  products!: product[];
  getProducts!: Sequelize.HasManyGetAssociationsMixin<product>;
  setProducts!: Sequelize.HasManySetAssociationsMixin<product, productId>;
  addProduct!: Sequelize.HasManyAddAssociationMixin<product, productId>;
  addProducts!: Sequelize.HasManyAddAssociationsMixin<product, productId>;
  createProduct!: Sequelize.HasManyCreateAssociationMixin<product>;
  removeProduct!: Sequelize.HasManyRemoveAssociationMixin<product, productId>;
  removeProducts!: Sequelize.HasManyRemoveAssociationsMixin<product, productId>;
  hasProduct!: Sequelize.HasManyHasAssociationMixin<product, productId>;
  hasProducts!: Sequelize.HasManyHasAssociationsMixin<product, productId>;
  countProducts!: Sequelize.HasManyCountAssociationsMixin;

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
