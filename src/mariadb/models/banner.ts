import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface bannerAttributes {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  redirects: string;
  is_active?: number;
  has_button?: number;
  created_by?: string;
  created_at?: Date;
  last_modified?: Date;
  btn_text: string;
  btn_icon: string;
}

export type bannerPk = "id";
export type bannerId = banner[bannerPk];
export type bannerOptionalAttributes = "description" | "is_active" | "has_button" | "created_by" | "created_at" | "last_modified" | "btn_text" | "btn_icon";
export type bannerCreationAttributes = Optional<bannerAttributes, bannerOptionalAttributes>;

export class banner extends Model<bannerAttributes, bannerCreationAttributes> implements bannerAttributes {
  id!: string;
  title!: string;
  description?: string;
  image_url!: string;
  redirects!: string;
  is_active?: number;
  has_button?: number;
  created_by?: string;
  created_at?: Date;
  last_modified?: Date;
  btn_text!: string;
  btn_icon!: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof banner {
    return banner.init({
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
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    redirects: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    has_button: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    created_by: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    last_modified: {
      type: DataTypes.DATE,
      allowNull: true
    },
    btn_text: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "N\/A"
    },
    btn_icon: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "shopping_cart"
    }
  }, {
    sequelize,
    tableName: 'banners',
    timestamps: true,
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
