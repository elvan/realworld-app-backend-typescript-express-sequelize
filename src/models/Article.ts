import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import slugify from 'slugify';

// Article attributes interface
interface ArticleAttributes {
  id: number;
  slug: string;
  title: string;
  description: string;
  body: string;
  author_id: number;
  created_at: Date;
  updated_at: Date;
}

// Attributes for Article creation
interface ArticleCreationAttributes extends Optional<ArticleAttributes, 'id' | 'slug' | 'created_at' | 'updated_at'> {}

// Article instance interface with methods
interface ArticleInstance extends Model<ArticleAttributes, ArticleCreationAttributes>, ArticleAttributes {
  getTags: () => Promise<any[]>;
  getFavorites: (options?: any) => Promise<any[]>;
  countFavorites: () => Promise<number>;
  getComments: () => Promise<any[]>;
  getAuthor: () => Promise<any>;
  toJSON: (currentUserId?: number) => any;
  setTags: (tags: any[]) => Promise<void>;
}

export default (sequelize: Sequelize, DataTypes: any) => {
  const Article = sequelize.define<ArticleInstance>(
    'Article',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Title cannot be empty',
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Description cannot be empty',
          },
        },
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Body cannot be empty',
          },
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
      tableName: 'articles',
      hooks: {
        beforeValidate: (article: ArticleInstance) => {
          if (article.title) {
            // Generate a unique slug based on title
            const baseSlug = slugify(article.title, {
              lower: true,
              strict: true,
            });
            
            // Add a unique suffix if this is a new article
            if (!article.slug) {
              const timestamp = new Date().getTime().toString().slice(-6);
              article.slug = `${baseSlug}-${timestamp}`;
            }
          }
        },
      },
    }
  );

  // Add instance methods
  Article.prototype.toJSON = async function (this: ArticleInstance, currentUserId?: number) {
    // Get author and tags using promise.all to parallelize requests
    const [author, tags, comments] = await Promise.all([
      this.getAuthor(),
      this.getTags(),
      this.getComments(),
    ]);
    
    // Get favorites count separately - using the sequelize instance to avoid circular imports
    const favoritesCount = await sequelize.model('ArticleFavorite').count({
      where: { article_id: this.id }
    });

    let favorited = false;

    if (currentUserId) {
      // Check if the current user has favorited this article
      const favorite = await sequelize.model('ArticleFavorite').findOne({
        where: {
          user_id: currentUserId,
          article_id: this.id
        }
      });
      favorited = !!favorite;
    }

    return {
      slug: this.slug,
      title: this.title,
      description: this.description,
      body: this.body,
      tagList: tags.map((tag: any) => tag.name),
      createdAt: this.created_at,
      updatedAt: this.updated_at,
      favorited,
      favoritesCount,
      author: author ? author.toProfileJSON(currentUserId) : null,
    };
  };

  // Define associations
  (Article as any).associate = (models: any) => {
    Article.belongsTo(models.User, {
      foreignKey: 'author_id',
      as: 'author',
    });

    Article.hasMany(models.Comment, {
      foreignKey: 'article_id',
      as: 'comments',
    });

    Article.belongsToMany(models.Tag, {
      through: 'article_tags',
      as: 'tags',
      foreignKey: 'article_id',
      otherKey: 'tag_id',
    });

    Article.belongsToMany(models.User, {
      through: models.ArticleFavorite,
      as: 'favorites',
      foreignKey: 'article_id',
      otherKey: 'user_id',
    });
  };

  return Article;
};
