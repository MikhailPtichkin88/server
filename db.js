const { Sequelize } = require('sequelize');
const { pg } = require('pg');
module.exports = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  dialect: 'postgres',
  dialectModule: pg,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
});
