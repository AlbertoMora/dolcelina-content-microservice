import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { user, userId } from './user';

export interface ban_caseAttributes {
  id: string;
  player_report?: string;
  resolution?: string;
  banned_player_id?: string;
  reported_by_player_id?: string;
  is_player_banned: number;
  creation_date?: Date;
  resolved_at?: Date;
  banned_until?: Date;
  last_modified?: Date;
}

export type ban_casePk = "id";
export type ban_caseId = ban_case[ban_casePk];
export type ban_caseOptionalAttributes = "player_report" | "resolution" | "banned_player_id" | "reported_by_player_id" | "creation_date" | "resolved_at" | "banned_until" | "last_modified";
export type ban_caseCreationAttributes = Optional<ban_caseAttributes, ban_caseOptionalAttributes>;

export class ban_case extends Model<ban_caseAttributes, ban_caseCreationAttributes> implements ban_caseAttributes {
  id!: string;
  player_report?: string;
  resolution?: string;
  banned_player_id?: string;
  reported_by_player_id?: string;
  is_player_banned!: number;
  creation_date?: Date;
  resolved_at?: Date;
  banned_until?: Date;
  last_modified?: Date;

  // ban_case belongsTo user via banned_player_id
  banned_player!: user;
  getBanned_player!: Sequelize.BelongsToGetAssociationMixin<user>;
  setBanned_player!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createBanned_player!: Sequelize.BelongsToCreateAssociationMixin<user>;
  // ban_case belongsTo user via reported_by_player_id
  reported_by_player!: user;
  getReported_by_player!: Sequelize.BelongsToGetAssociationMixin<user>;
  setReported_by_player!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createReported_by_player!: Sequelize.BelongsToCreateAssociationMixin<user>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ban_case {
    return ban_case.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    player_report: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    resolution: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    banned_player_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reported_by_player_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    is_player_banned: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    banned_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_modified: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ban_cases',
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
        name: "ban_cases_x_users_fk1",
        using: "BTREE",
        fields: [
          { name: "banned_player_id" },
        ]
      },
      {
        name: "ban_cases_x_users_fk2",
        using: "BTREE",
        fields: [
          { name: "reported_by_player_id" },
        ]
      },
    ]
  });
  }
}
