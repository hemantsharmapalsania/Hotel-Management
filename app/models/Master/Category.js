const { DataTypes } = require('sequelize');
const User = require('../User');
const sequelize = require('../../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    category_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category_type: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: true
});

Category.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Category, { foreignKey: 'user_id' });

module.exports = Category;