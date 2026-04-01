import type { Sequelize } from "sequelize";
import { ban_case as _ban_case } from "./ban_case";
import type { ban_caseAttributes, ban_caseCreationAttributes } from "./ban_case";
import { banner as _banner } from "./banner";
import type { bannerAttributes, bannerCreationAttributes } from "./banner";
import { category as _category } from "./category";
import type { categoryAttributes, categoryCreationAttributes } from "./category";
import { product_image as _product_image } from "./product_image";
import type { product_imageAttributes, product_imageCreationAttributes } from "./product_image";
import { product as _product } from "./product";
import type { productAttributes, productCreationAttributes } from "./product";
import { user as _user } from "./user";
import type { userAttributes, userCreationAttributes } from "./user";

export {
  _ban_case as ban_case,
  _banner as banner,
  _category as category,
  _product_image as product_image,
  _product as product,
  _user as user,
};

export type {
  ban_caseAttributes,
  ban_caseCreationAttributes,
  bannerAttributes,
  bannerCreationAttributes,
  categoryAttributes,
  categoryCreationAttributes,
  product_imageAttributes,
  product_imageCreationAttributes,
  productAttributes,
  productCreationAttributes,
  userAttributes,
  userCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const ban_case = _ban_case.initModel(sequelize);
  const banner = _banner.initModel(sequelize);
  const category = _category.initModel(sequelize);
  const product_image = _product_image.initModel(sequelize);
  const product = _product.initModel(sequelize);
  const user = _user.initModel(sequelize);

  product.belongsTo(category, { as: "category", foreignKey: "category_id"});
  category.hasMany(product, { as: "products", foreignKey: "category_id"});
  ban_case.belongsTo(user, { as: "banned_player", foreignKey: "banned_player_id"});
  user.hasMany(ban_case, { as: "ban_cases", foreignKey: "banned_player_id"});
  ban_case.belongsTo(user, { as: "reported_by_player", foreignKey: "reported_by_player_id"});
  user.hasMany(ban_case, { as: "reported_by_player_ban_cases", foreignKey: "reported_by_player_id"});

  return {
    ban_case: ban_case,
    banner: banner,
    category: category,
    product_image: product_image,
    product: product,
    user: user,
  };
}
