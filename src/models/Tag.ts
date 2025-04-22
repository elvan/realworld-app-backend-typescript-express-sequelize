import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

// Tag attributes interface
interface TagAttributes {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

// Attributes for Tag creation
interface TagCreationAttributes extends Optional<TagAttributes, 'id' | 'created_at' | 'updated_at'> {}

// Tag instance interface
interface TagInstance extends Model<TagAttributes, TagCreationAttributes>, TagAttributes {}

export default (sequelize: Sequelize, DataTypes: any) => {
  const Tag = sequelize.define<TagInstance>(
    'Tag',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: 'Tag name cannot be empty',
          },
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
      tableName: 'tags',
    }
  );

  // Define associations
  (Tag as any).associate = (models: any) => {
    Tag.belongsToMany(models.Article, {
      through: 'article_tags',
      as: 'articles',
      foreignKey: 'tag_id',
      otherKey: 'article_id',
    });
  };

  return Tag;
};
