const { Sequelize } = require('sequelize');
const config = require("./config.js")

const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASSWORD, {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: 'mssql',
    logging: console.log,
    dialectOptions: {
        encrypt: config.NODE_ENV === "production",
    }
});

module.exports = sequelize;
