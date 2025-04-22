import { Request, Response, NextFunction } from 'express';
import db from '../models';
import { ApiError } from '../middleware/errorHandler';

export class CommentController {
  /**
   * Get comments for an article
   */
  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const currentUserId = req.userId;

      // Find article by slug
      const article = await db.Article.findOne({ where: { slug } });
      if (!article) {
        throw ApiError.notFound('Article not found');
      }

      // Get comments for article
      const comments = await db.Comment.findAll({
        where: { article_id: article.id },
        include: [
          {
            model: db.User,
            as: 'author',
            attributes: ['id', 'username', 'bio', 'image']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // Process comments to include author following status
      const commentsWithData = await Promise.all(
        comments.map(async (comment: any) => {
          // Get author following status
          let following = false;
          if (currentUserId) {
            const followRelation = await db.UserFollow.findOne({
              where: {
                follower_id: currentUserId,
                followed_id: comment.author.id
              }
            });
            following = !!followRelation;
          }

          return {
            id: comment.id,
            body: comment.body,
            createdAt: comment.created_at,
            updatedAt: comment.updated_at,
            author: {
              username: comment.author.username,
              bio: comment.author.bio || '',
              image: comment.author.image || '',
              following
            }
          };
        })
      );

      return res.status(200).json({ comments: commentsWithData });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a comment to an article
   */
  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const { body } = req.body.comment;
      const currentUserId = req.userId;

      // Find article by slug
      const article = await db.Article.findOne({ where: { slug } });
      if (!article) {
        throw ApiError.notFound('Article not found');
      }

      // Create comment
      const comment = await db.Comment.create({
        body,
        article_id: article.id,
        author_id: currentUserId
      });

      // Get created comment with author
      const createdComment = await db.Comment.findByPk(comment.id, {
        include: [
          {
            model: db.User,
            as: 'author',
            attributes: ['id', 'username', 'bio', 'image']
          }
        ]
      });

      // Format comment response
      const commentResponse = {
        id: createdComment.id,
        body: createdComment.body,
        createdAt: createdComment.created_at,
        updatedAt: createdComment.updated_at,
        author: {
          username: createdComment.author.username,
          bio: createdComment.author.bio || '',
          image: createdComment.author.image || '',
          following: false // Would need to check separately
        }
      };

      return res.status(201).json({ comment: commentResponse });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug, id } = req.params;
      const currentUserId = req.userId;

      // Find article by slug
      const article = await db.Article.findOne({ where: { slug } });
      if (!article) {
        throw ApiError.notFound('Article not found');
      }

      // Find comment
      const comment = await db.Comment.findOne({
        where: {
          id,
          article_id: article.id
        }
      });

      if (!comment) {
        throw ApiError.notFound('Comment not found');
      }

      // Check if user is the author of the comment
      if (comment.author_id !== currentUserId) {
        throw ApiError.forbidden('You are not authorized to delete this comment');
      }

      // Delete comment
      await comment.destroy();

      return res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
