import { Request, Response, NextFunction } from 'express';
import db from '../models';
import { ApiError } from '../middleware/errorHandler';

export class ProfileController {
  /**
   * Get a user's profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const currentUserId = req.userId;

      // Find user by username
      const user = await db.User.findOne({ where: { username } });
      if (!user) {
        throw ApiError.notFound('User not found');
      }

      // Check if current user is following this profile
      let isFollowing = false;
      if (currentUserId) {
        const follow = await db.UserFollow.findOne({
          where: {
            follower_id: currentUserId,
            followed_id: user.id
          }
        });
        isFollowing = !!follow;
      }

      // Create profile response
      const profile = {
        username: user.username,
        bio: user.bio || '',
        image: user.image || '',
        following: isFollowing
      };

      return res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Follow a user
   */
  async followUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const currentUserId = req.userId;

      // Find user to follow
      const userToFollow = await db.User.findOne({ where: { username } });
      if (!userToFollow) {
        throw ApiError.notFound('User not found');
      }

      // Don't allow user to follow themselves
      if (userToFollow.id === currentUserId) {
        throw ApiError.validationError({ errors: { username: ["You can't follow yourself"] } });
      }

      // Check if already following
      const existingFollow = await db.UserFollow.findOne({
        where: {
          follower_id: currentUserId,
          followed_id: userToFollow.id
        }
      });

      if (!existingFollow) {
        // Create new follow relationship
        await db.UserFollow.create({
          follower_id: currentUserId,
          followed_id: userToFollow.id
        });
      }

      // Return profile with following set to true
      const profile = {
        username: userToFollow.username,
        bio: userToFollow.bio || '',
        image: userToFollow.image || '',
        following: true
      };

      return res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const currentUserId = req.userId;

      // Find user to unfollow
      const userToUnfollow = await db.User.findOne({ where: { username } });
      if (!userToUnfollow) {
        throw ApiError.notFound('User not found');
      }

      // Delete follow relationship if it exists
      await db.UserFollow.destroy({
        where: {
          follower_id: currentUserId,
          followed_id: userToUnfollow.id
        }
      });

      // Return profile with following set to false
      const profile = {
        username: userToUnfollow.username,
        bio: userToUnfollow.bio || '',
        image: userToUnfollow.image || '',
        following: false
      };

      return res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  }
}
