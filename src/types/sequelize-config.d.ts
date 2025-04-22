// Type definitions for sequelize-config module
declare module '../../sequelize-config' {
  interface SequelizeConfig {
    username: string;
    password: string;
    database: string;
    host: string;
    port: number;
    dialect: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';
    logging?: boolean | ((msg: string) => void);
    dialectOptions?: {
      charset?: string;
      dateStrings?: boolean;
      typeCast?: boolean;
      [key: string]: any;
    };
    timezone?: string;
    define?: {
      timestamps?: boolean;
      underscored?: boolean;
      underscoredAll?: boolean;
      createdAt?: string;
      updatedAt?: string;
      [key: string]: any;
    };
  }

  interface Config {
    development: SequelizeConfig;
    test: SequelizeConfig;
    production: SequelizeConfig;
    [key: string]: SequelizeConfig;
  }

  const config: Config;
  export default config;
}
