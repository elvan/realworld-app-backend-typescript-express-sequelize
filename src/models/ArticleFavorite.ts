import { Model, DataTypes, Sequelize } from 'sequelize';

// ArticleFavorite attributes interface
interface ArticleFavoriteAttributes {
  user_id: number;
  article_id: number;
  created_at: Date;
  updated_at: Date;
}

// ArticleFavorite instance interface
interface ArticleFavoriteInstance extends Model<ArticleFavoriteAttributes, ArticleFavoriteAttributes>, ArticleFavoriteAttributes {}

export default (sequelize: Sequelize, DataTypes: any) => {
  const ArticleFavorite = sequelize.define<ArticleFavoriteInstance>(
    'ArticleFavorite',
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      article_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'articles',
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
      tableName: 'article_favorites',
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'article_id'],
        },
      ],
    }
  );

  return ArticleFavorite;
};
