import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import db from '../models';
import { ApiError } from '../middleware/errorHandler';

export class ArticleController {
  /**
   * Get all articles
   */
  async getArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const { tag, author, favorited, limit = 20, offset = 0 } = req.query;
      const currentUserId = req.userId;

      // Build query conditions
      const whereConditions: any = {};
      const include: any[] = [
        {
          model: db.User,
          as: 'author',
          attributes: ['id', 'username', 'bio', 'image']
        },
        {
          model: db.Tag,
          as: 'tags',
          attributes: ['name'],
          through: { attributes: [] }
        }
      ];

      // Filter by tag
      if (tag) {
        include.push({
          model: db.Tag,
          as: 'tags',
          where: { name: tag },
          attributes: [],
          through: { attributes: [] }
        });
      }

      // Filter by author
      if (author) {
        include[0].where = { username: author };
      }

      // Filter by favorited username
      if (favorited) {
        include.push({
          model: db.User,
          as: 'favorites',
          where: { username: favorited },
          attributes: [],
          through: { attributes: [] }
        });
      }

      // Get articles count first
      const { count, rows: articles } = await db.Article.findAndCountAll({
        where: whereConditions,
        include,
        order: [['created_at', 'DESC']],
        limit: Number(limit),
        offset: Number(offset),
        distinct: true
      });

      // Process articles to include additional data
      const articlesWithData = await Promise.all(
        articles.map(async (article: any) => {
          // Check if current user has favorited this article
          let favorited = false;
          if (currentUserId) {
            const favorite = await db.ArticleFavorite.findOne({
              where: {
                user_id: currentUserId,
                article_id: article.id
              }
            });
            favorited = !!favorite;
          }

          // Count favorites
          const favoritesCount = await db.ArticleFavorite.count({
            where: { article_id: article.id }
          });

          // Get author following status
          let authorFollowing = false;
          if (currentUserId && article.author) {
            const following = await db.UserFollow.findOne({
              where: {
                follower_id: currentUserId,
                followed_id: article.author.id
              }
            });
            authorFollowing = !!following;
          }

          // Format article response
          return {
            slug: article.slug,
            title: article.title,
            description: article.description,
            body: article.body,
            tagList: article.tags.map((tag: any) => tag.name),
            createdAt: article.created_at,
            updatedAt: article.updated_at,
            favorited,
            favoritesCount,
            author: {
              username: article.author.username,
              bio: article.author.bio || '',
              image: article.author.image || '',
              following: authorFollowing
            }
          };
        })
      );

      return res.status(200).json({
        articles: articlesWithData,
        articlesCount: count
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get feed articles (from followed users)
   */
  async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const currentUserId = req.userId;

      // Find users that the current user follows
      const following = await db.UserFollow.findAll({
        where: { follower_id: currentUserId },
        attributes: ['followed_id']
      });

      if (!following.length) {
        return res.status(200).json({
          articles: [],
          articlesCount: 0
        });
      }

      // Get followed user IDs
      const followedUserIds = following.map((follow: any) => follow.followed_id);

      // Find articles from followed users
      const { count, rows: articles } = await db.Article.findAndCountAll({
        where: {
          author_id: { [Op.in]: followedUserIds }
        },
        include: [
          {
            model: db.User,
            as: 'author',
            attributes: ['id', 'username', 'bio', 'image']
          },
          {
            model: db.Tag,
            as: 'tags',
            attributes: ['name'],
            through: { attributes: [] }
          }
        ],
        order: [['created_at', 'DESC']],
        limit: Number(limit),
        offset: Number(offset),
        distinct: true
      });

      // Process articles to include additional data
      const articlesWithData = await Promise.all(
        articles.map(async (article: any) => {
          // Check if current user has favorited this article
          const favorite = await db.ArticleFavorite.findOne({
            where: {
              user_id: currentUserId,
              article_id: article.id
            }
          });

          // Count favorites
          const favoritesCount = await db.ArticleFavorite.count({
            where: { article_id: article.id }
          });

          // Format article response
          return {
            slug: article.slug,
            title: article.title,
            description: article.description,
            body: article.body,
            tagList: article.tags.map((tag: any) => tag.name),
            createdAt: article.created_at,
            updatedAt: article.updated_at,
            favorited: !!favorite,
            favoritesCount,
            author: {
              username: article.author.username,
              bio: article.author.bio || '',
              image: article.author.image || '',
              following: true // By definition, we're following these authors
            }
          };
        })
      );

      return res.status(200).json({
        articles: articlesWithData,
        articlesCount: count
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get an article by slug
   */
  async getArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const currentUserId = req.userId;

      // Find article by slug
      const article = await db.Article.findOne({
        where: { slug },
        include: [
          {
            model: db.User,
            as: 'author',
            attributes: ['id', 'username', 'bio', 'image']
          },
          {
            model: db.Tag,
            as: 'tags',
            attributes: ['name'],
            through: { attributes: [] }
          }
        ]
      });

      if (!article) {
        throw ApiError.notFound('Article not found');
      }

      // Check if current user has favorited this article
      let favorited = false;
      if (currentUserId) {
        const favorite = await db.ArticleFavorite.findOne({
          where: {
            user_id: currentUserId,
            article_id: article.id
          }
        });
        favorited = !!favorite;
      }

      // Count favorites
      const favoritesCount = await db.ArticleFavorite.count({
        where: { article_id: article.id }
      });

      // Get author following status
      let authorFollowing = false;
      if (currentUserId && article.author) {
        const following = await db.UserFollow.findOne({
          where: {
            follower_id: currentUserId,
            followed_id: article.author.id
          }
        });
        authorFollowing = !!following;
      }

      // Format article response
      const articleResponse = {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tags.map((tag: any) => tag.name),
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        favorited,
        favoritesCount,
        author: {
          username: article.author.username,
          bio: article.author.bio || '',
          image: article.author.image || '',
          following: authorFollowing
        }
      };

      return res.status(200).json({ article: articleResponse });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new article
   */
  async createArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, body, tagList = [] } = req.body.article;
      const currentUserId = req.userId;

      // Create the article
      const article = await db.Article.create({
        title,
        description,
        body,
        author_id: currentUserId
      });

      // Handle tags
      if (tagList && tagList.length > 0) {
        // Find or create tags
        const tags = await Promise.all(
          tagList.map(async (tagName: string) => {
            const [tag] = await db.Tag.findOrCreate({
              where: { name: tagName.trim().toLowerCase() }
            });
            return tag;
          })
        );

        // Associate tags with article
        await article.setTags(tags);
      }

      // Get the complete article with associations
      const createdArticle = await db.Article.findByPk(article.id, {
        include: [
          {
            model: db.User,
            as: 'author',
            attributes: ['id', 'username', 'bio', 'image']
          },
          {
            model: db.Tag,
            as: 'tags',
            attributes: ['name'],
            through: { attributes: [] }
          }
        ]
      });

      // Format article response
      const articleResponse = {
        slug: createdArticle.slug,
        title: createdArticle.title,
        description: createdArticle.description,
        body: createdArticle.body,
        tagList: createdArticle.tags.map((tag: any) => tag.name),
        createdAt: createdArticle.created_at,
        updatedAt: createdArticle.updated_at,
        favorited: false,
        favoritesCount: 0,
        author: {
          username: createdArticle.author.username,
          bio: createdArticle.author.bio || '',
          image: createdArticle.author.image || '',
          following: false
        }
      };

      return res.status(201).json({ article: articleResponse });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an article
   */
  async updateArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const { title, description, body, tagList } = req.body.article;
      const currentUserId = req.userId;

      // Find article by slug
      const article = await db.Article.findOne({ where: { slug } });

      if (!article) {
        throw ApiError.notFound('Article not found');
      }

      // Check if user is the author
      if (article.author_id !== currentUserId) {
        throw ApiError.forbidden('You are not authorized to update this article');
      }

      // Update article properties
      if (title) article.title = title;
      if (description) article.description = description;
      if (body) article.body = body;

      // Save changes
      await article.save();

      // Update tags if provided
      if (tagList && Array.isArray(tagList)) {
        // Find or create tags
        const tags = await Promise.all(
          tagList.map(async (tagName: string) => {
            const [tag] = await db.Tag.findOrCreate({
              where: { name: tagName.trim().toLowerCase() }
            });
            return tag;
          })
        );

        // Associate tags with article
        await article.setTags(tags);
      }

      // Get updated article with associations
      const updatedArticle = await db.Article.findOne({
        where: { id: article.id },
        include: [
          {
            model: db.User,
            as: 'author',
            attributes: ['id', 'username', 'bio', 'image']
          },
          {
            model: db.Tag,
            as: 'tags',
            attributes: ['name'],
            through: { attributes: [] }
          }
        ]
      });

      // Count favorites
      const favoritesCount = await db.ArticleFavorite.count({
        where: { article_id: article.id }
      });

      // Check if current user has favorited this article
      const favorite = await db.ArticleFavorite.findOne({
        where: {
          user_id: currentUserId,
          article_id: article.id
        }
      });

      // Format article response
      const articleResponse = {
        slug: updatedArticle.slug,
        title: updatedArticle.title,
        description: updatedArticle.description,
        body: updatedArticle.body,
        tagList: updatedArticle.tags.map((tag: any) => tag.name),
        createdAt: updatedArticle.created_at,
        updatedAt: updatedArticle.updated_at,
        favorited: !!favorite,
        favoritesCount,
        author: {
          username: updatedArticle.author.username,
          bio: updatedArticle.author.bio || '',
          image: updatedArticle.author.image || '',
          following: false // This would need to be checked separately
        }
      };

      return res.status(200).json({ article: articleResponse });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an article
   */
  async deleteArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const currentUserId = req.userId;

      // Find article by slug
      const article = await db.Article.findOne({ where: { slug } });

      if (!article) {
        throw ApiError.notFound('Article not found');
      }

      // Check if user is the author
      if (article.author_id !== currentUserId) {
        throw ApiError.forbidden('You are not authorized to delete this article');
      }

      // Delete article
      await article.destroy();

      return res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Favorite an article
   */
  async favoriteArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const currentUserId = req.userId;

      // Find article by slug
      const article = await db.Article.findOne({
        where: { slug },
        include: [
          {
            model: db.User,
            as: 'author',
            attributes: ['id', 'username', 'bio', 'image']
          },
          {
            model: db.Tag,
            as: 'tags',
            attributes: ['name'],
            through: { attributes: [] }
          }
        ]
      });

      if (!article) {
        throw ApiError.notFound('Article not found');
      }

      // Check if already favorited
      const existingFavorite = await db.ArticleFavorite.findOne({
        where: {
          user_id: currentUserId,
          article_id: article.id
        }
      });

      if (!existingFavorite) {
        // Create favorite
        await db.ArticleFavorite.create({
          user_id: currentUserId,
          article_id: article.id
        });
      }

      // Count favorites
      const favoritesCount = await db.ArticleFavorite.count({
        where: { article_id: article.id }
      });

      // Get author following status
      const following = await db.UserFollow.findOne({
        where: {
          follower_id: currentUserId,
          followed_id: article.author.id
        }
      });

      // Format article response
      const articleResponse = {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tags.map((tag: any) => tag.name),
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        favorited: true,
        favoritesCount,
        author: {
          username: article.author.username,
          bio: article.author.bio || '',
          image: article.author.image || '',
          following: !!following
        }
      };

      return res.status(200).json({ article: articleResponse });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unfavorite an article
   */
  async unfavoriteArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const currentUserId = req.userId;

      // Find article by slug
      const article = await db.Article.findOne({
        where: { slug },
        include: [
          {
            model: db.User,
            as: 'author',
            attributes: ['id', 'username', 'bio', 'image']
          },
          {
            model: db.Tag,
            as: 'tags',
            attributes: ['name'],
            through: { attributes: [] }
          }
        ]
      });

      if (!article) {
        throw ApiError.notFound('Article not found');
      }

      // Delete favorite if it exists
      await db.ArticleFavorite.destroy({
        where: {
          user_id: currentUserId,
          article_id: article.id
        }
      });

      // Count favorites
      const favoritesCount = await db.ArticleFavorite.count({
        where: { article_id: article.id }
      });

      // Get author following status
      const following = await db.UserFollow.findOne({
        where: {
          follower_id: currentUserId,
          followed_id: article.author.id
        }
      });

      // Format article response
      const articleResponse = {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tags.map((tag: any) => tag.name),
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        favorited: false,
        favoritesCount,
        author: {
          username: article.author.username,
          bio: article.author.bio || '',
          image: article.author.image || '',
          following: !!following
        }
      };

      return res.status(200).json({ article: articleResponse });
    } catch (error) {
      next(error);
    }
  }
}
