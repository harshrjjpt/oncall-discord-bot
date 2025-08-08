require('dotenv').config();
const path = require('path');

const usePostgres = !!process.env.DATABASE_URL;

module.exports = {
  development: {
    client: usePostgres ? 'pg' : 'sqlite3',
    connection: usePostgres ? process.env.DATABASE_URL : {
      filename: path.resolve(process.env.SQLITE_FILE || './data/oncall.db')
    },
    useNullAsDefault: true,
    pool: {
      min: 1,
      max: 5
    },
    migrations: {
      directory: path.resolve(__dirname, 'migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, 'seeds')
    }
  }
};