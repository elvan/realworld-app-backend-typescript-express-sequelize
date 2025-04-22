import { Model, DataTypes, Sequelize } from 'sequelize';

// UserFollow attributes interface
interface UserFollowAttributes {
  follower_id: number;
  followed_id: number;
  created_at: Date;
  updated_at: Date;
}

// UserFollow instance interface
interface UserFollowInstance extends Model<UserFollowAttributes, UserFollowAttributes>, UserFollowAttributes {}

export default (sequelize: Sequelize, DataTypes: any) => {
  const UserFollow = sequelize.define<UserFollowInstance>(
    'UserFollow',
    {
      follower_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      followed_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'user_follows',
      indexes: [
        {
          unique: true,
          fields: ['follower_id', 'followed_id'],
        },
      ],
    }
  );

  return UserFollow;
};
