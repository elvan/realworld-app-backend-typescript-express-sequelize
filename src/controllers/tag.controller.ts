import { Request, Response, NextFunction } from 'express';
import db from '../models';

export class TagController {
  /**
   * Get all tags
   */
  async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      // Get all tags
      const tags = await db.Tag.findAll({
        attributes: ['name'],
        order: [['name', 'ASC']]
      });

      // Extract tag names
      const tagNames = tags.map((tag: any) => tag.name);

      return res.status(200).json({ tags: tagNames });
    } catch (error) {
      next(error);
    }
  }
}
