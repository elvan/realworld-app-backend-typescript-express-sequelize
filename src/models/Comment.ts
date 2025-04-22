import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

// Comment attributes interface
interface CommentAttributes {
  id: number;
  body: string;
  article_id: number;
  author_id: number;
  created_at: Date;
  updated_at: Date;
}

// Attributes for Comment creation
interface CommentCreationAttributes extends Optional<CommentAttributes, 'id' | 'created_at' | 'updated_at'> {}

// Comment instance interface with methods
interface CommentInstance extends Model<CommentAttributes, CommentCreationAttributes>, CommentAttributes {
  getAuthor: () => Promise<any>;
  toJSON: (currentUserId?: number) => any;
}

export default (sequelize: Sequelize, DataTypes: any) => {
  const Comment = sequelize.define<CommentInstance>(
    'Comment',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Comment body cannot be empty',
          },
        },
      },
      article_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'articles',
          key: 'id',
        },
      },
      author_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      tableName: 'comments',
    }
  );

  // Add instance methods
  Comment.prototype.toJSON = async function (this: CommentInstance, currentUserId?: number) {
    const author = await this.getAuthor();

    return {
      id: this.id,
      body: this.body,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
      author: author ? author.toProfileJSON(currentUserId) : null,
    };
  };

  // Define associations
  (Comment as any).associate = (models: any) => {
    Comment.belongsTo(models.Article, {
      foreignKey: 'article_id',
      as: 'article',
      onDelete: 'CASCADE',
    });

    Comment.belongsTo(models.User, {
      foreignKey: 'author_id',
      as: 'author',
    });
  };

  return Comment;
};
