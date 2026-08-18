process.loadEnvFile();

const { DB_DEV, DB_DEPLOY, USERDB, PASSWORD, HOST, DIALECT, PORT_DB } =
  process.env;

module.exports = {
  development: {
    username: USERDB,
    password: PASSWORD,
    database: DB_DEV,
    host: HOST,
    port: PORT_DB,
    dialect: DIALECT,
    logging: false,
    timezone: "-04:00",
    define: {
      freezeTableName: true,
    },
  },
  test: {
    username: USERDB,
    password: PASSWORD,
    database: DB_DEV,
    host: HOST,
    port: PORT_DB,
    dialect: DIALECT,
    logging: false,
    timezone: "-04:00",
    define: {
      freezeTableName: true,
    },
  },
  production: {
    username: USERDB,
    password: PASSWORD,
    database: DB_DEPLOY,
    host: HOST,
    port: PORT_DB,
    dialect: DIALECT,
    logging: false,
    timezone: "-04:00",
    define: {
      freezeTableName: true,
    },
  },
};
