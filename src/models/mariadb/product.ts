import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface productAttributes {
  id: string;
  title: string;
  description?: string;
  primary_image_id: string;
  price?: number;
  category_id: string;
  stock?: number;
  servings_per_unit?: number;
  serving_size?: number;
  serving_unit?: string;
  energy?: number;
  carbs?: number;
  sugars?: number;
  diet_fiber?: number;
  added_sugars?: number;
  fat?: number;
  saturated_fat?: number;
  trans_fat?: number;
  cholesterol?: number;
  sodium?: number;
  protein?: number;
  created_by?: string;
  creation_date?: Date;
  last_modified?: Date;
  is_active: boolean;
}

export type productPk = "id";
export type productId = product[productPk];
export type productOptionalAttributes = "description" | "price" | "stock" | "servings_per_unit" | "serving_size" | "serving_unit" | "energy" | "carbs" | "sugars" | "diet_fiber" | "added_sugars" | "fat" | "saturated_fat" | "trans_fat" | "cholesterol" | "sodium" | "protein" | "created_by" | "creation_date" | "last_modified";
export type productCreationAttributes = Optional<productAttributes, productOptionalAttributes>;

export class product extends Model<productAttributes, productCreationAttributes> implements productAttributes {
  id!: string;
  title!: string;
  description?: string;
  primary_image_id!: string;
  price?: number;
  category_id!: string;
  stock?: number;
  servings_per_unit?: number;
  serving_size?: number;
  serving_unit?: string;
  energy?: number;
  carbs?: number;
  sugars?: number;
  diet_fiber?: number;
  added_sugars?: number;
  fat?: number;
  saturated_fat?: number;
  trans_fat?: number;
  cholesterol?: number;
  sodium?: number;
  protein?: number;
  created_by?: string;
  creation_date?: Date;
  last_modified?: Date;
  is_active!: boolean;


  static initModel(sequelize: Sequelize.Sequelize): typeof product {
    return product.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    primary_image_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    category_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    servings_per_unit: {
      type: DataTypes.DECIMAL(3,2),
      allowNull: true
    },
    serving_size: {
      type: DataTypes.DECIMAL(3,2),
      allowNull: true
    },
    serving_unit: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    energy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    carbs: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sugars: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    diet_fiber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    added_sugars: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    saturated_fat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    trans_fat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cholesterol: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sodium: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    protein: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_by: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_modified: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'products',
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
    ]
  });
  }
}
