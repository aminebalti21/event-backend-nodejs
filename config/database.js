const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
    process.env.DB_NAME, // Nom de la base de données
    process.env.DB_USER, // Utilisateur MySQL
    process.env.DB_PASSWORD, // Mot de passe MySQL
    {
        host: process.env.DB_HOST, // Hôte (localhost par défaut)
        dialect: "mysql",
    }
);

module.exports = sequelize;
