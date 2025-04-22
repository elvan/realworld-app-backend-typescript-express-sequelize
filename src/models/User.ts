import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// User attributes interface
interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  bio: string | null;
  image: string | null;
  created_at: Date;
  updated_at: Date;
}

// Attributes for User creation
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'bio' | 'image' | 'created_at' | 'updated_at'> {}

// User instance interface with methods
interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
  verifyPassword(password: string): Promise<boolean>;
  generateJWT(): string;
  toProfileJSON(currentUserId?: number): any;
  toAuthJSON(): any;
}

export default (sequelize: Sequelize, DataTypes: any) => {
  const User = sequelize.define<UserInstance>(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: 'Username cannot be empty',
          },
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Invalid email format',
          },
          notEmpty: {
            msg: 'Email cannot be empty',
          },
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Password cannot be empty',
          },
          len: {
            args: [6, 100],
            msg: 'Password must be between 6 and 100 characters',
          },
        },
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
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
      tableName: 'users',
      hooks: {
        beforeSave: async (user: UserInstance) => {
          // Only hash the password if it's been modified (or is new)
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  // Add instance methods
  const UserPrototype = User.prototype as any;
  
  UserPrototype.verifyPassword = async function (this: UserInstance, password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  };

  UserPrototype.generateJWT = function (this: UserInstance): string {
    const payload = {
      id: this.id,
      username: this.username,
      email: this.email,
    };
    const secret = process.env.JWT_SECRET || 'secret';
    
    // For type safety, we'll use a numeric value (in seconds) for expiresIn
    // 86400 seconds = 1 day
    const defaultExpiry = 86400; // 1 day in seconds
    let expiresIn = defaultExpiry;
    
    if (process.env.JWT_EXPIRES_IN) {
      const parsed = parseInt(process.env.JWT_EXPIRES_IN);
      if (!isNaN(parsed)) {
        expiresIn = parsed;
      }
    }
    
    return jwt.sign(payload, secret, { expiresIn });
  };

  UserPrototype.toProfileJSON = function (this: UserInstance, currentUserId?: number) {
    const profile = {
      username: this.username,
      bio: this.bio || '',
      image: this.image || '',
      following: false, // Default value, will be set by service layer
    };

    return { profile };
  };

  UserPrototype.toAuthJSON = function (this: UserInstance) {
    return {
      user: {
        email: this.email,
        token: this.generateJWT(),
        username: this.username,
        bio: this.bio || '',
        image: this.image || '',
      },
    };
  };

  // Define associations
  (User as any).associate = (models: any) => {
    User.hasMany(models.Article, {
      foreignKey: 'author_id',
      as: 'articles',
    });

    User.hasMany(models.Comment, {
      foreignKey: 'author_id',
      as: 'comments',
    });

    User.belongsToMany(models.User, {
      through: models.UserFollow,
      as: 'followers',
      foreignKey: 'followed_id',
      otherKey: 'follower_id',
    });

    User.belongsToMany(models.User, {
      through: models.UserFollow,
      as: 'following',
      foreignKey: 'follower_id',
      otherKey: 'followed_id',
    });

    User.belongsToMany(models.Article, {
      through: models.ArticleFavorite,
      as: 'favorites',
      foreignKey: 'user_id',
      otherKey: 'article_id',
    });
  };

  return User;
};
