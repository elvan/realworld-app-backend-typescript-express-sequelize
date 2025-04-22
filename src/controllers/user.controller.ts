import { Request, Response, NextFunction } from 'express';
import db from '../models';
import { ApiError } from '../middleware/errorHandler';

export class UserController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password } = req.body.user;

      // Check if user already exists
      const existingUserByEmail = await db.User.findOne({ where: { email } });
      if (existingUserByEmail) {
        throw ApiError.validationError({ errors: { email: ['has already been taken'] } });
      }

      const existingUserByUsername = await db.User.findOne({ where: { username } });
      if (existingUserByUsername) {
        throw ApiError.validationError({ errors: { username: ['has already been taken'] } });
      }

      // Create new user
      const user = await db.User.create({ username, email, password });

      // Return user with JWT token
      return res.status(201).json(user.toAuthJSON());
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login a user
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body.user;

      // Find user by email
      const user = await db.User.findOne({ where: { email } });
      if (!user) {
        throw ApiError.unauthorized('Email or password is invalid');
      }

      // Verify password
      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        throw ApiError.unauthorized('Email or password is invalid');
      }

      // Return user with JWT token
      return res.status(200).json(user.toAuthJSON());
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      // User is already set in request by auth middleware
      const user = req.user;
      return res.status(200).json(user.toAuthJSON());
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current user
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { username, email, password, bio, image } = req.body.user;

      // Check if updating to existing username or email
      if (email && email !== user.email) {
        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
          throw ApiError.validationError({ errors: { email: ['has already been taken'] } });
        }
      }

      if (username && username !== user.username) {
        const existingUser = await db.User.findOne({ where: { username } });
        if (existingUser) {
          throw ApiError.validationError({ errors: { username: ['has already been taken'] } });
        }
      }

      // Update user fields
      if (username) user.username = username;
      if (email) user.email = email;
      if (password) user.password = password;
      if (bio !== undefined) user.bio = bio;
      if (image !== undefined) user.image = image;

      // Save updated user
      await user.save();

      // Return updated user
      return res.status(200).json(user.toAuthJSON());
    } catch (error) {
      next(error);
    }
  }
}
