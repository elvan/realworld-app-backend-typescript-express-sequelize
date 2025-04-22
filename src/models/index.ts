import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes, Model } from 'sequelize';

// Local declaration for the sequelize-config module
// @ts-ignore
import config from '../../sequelize-config';

// Load environment configuration
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: env === 'development' ? console.log : false,
    define: dbConfig.define,
    dialectOptions: dbConfig.dialectOptions,
    timezone: dbConfig.timezone
  }
);

// Interface for our database models
interface DB {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  [key: string]: any;
}

// Initialize database object
const db: DB = {
  sequelize,
  Sequelize
};

// Auto-load models
const basename = path.basename(__filename);
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      (file.endsWith('.ts') || file.endsWith('.js')) &&
      !file.endsWith('.test.ts') &&
      !file.endsWith('.test.js')
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file)).default(
      sequelize,
      DataTypes
    );
    db[model.name] = model;
  });

// Associate models if associations are defined
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
