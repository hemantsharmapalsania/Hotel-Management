const { DataTypes } = require('sequelize');
const Category = require('../Master/Category');
const User = require('../User');
const sequelize = require('../../config/database');

const Menu = sequelize.define('Menu', {
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
    menu_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Category,
            key: 'id'
        }
    }
}, {
    timestamps: true
});

Menu.belongsTo(Category, { foreignKey: 'user_id' });
Category.hasMany(Menu, { foreignKey: 'user_id' });

Menu.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Menu, { foreignKey: 'user_id' });

module.exports = Menu;