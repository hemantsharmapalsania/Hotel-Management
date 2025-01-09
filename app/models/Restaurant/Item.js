const { DataTypes } = require('sequelize');
const User = require('../User');
const sequelize = require('../../config/database');
const Menu = require('./Menu');

const Item = sequelize.define('Item', {
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
    menu_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Menu,
            key: 'id'
        }
    },
    item_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    quantity: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    image_keyword: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    }
}, {
    timestamps: true
});

Item.belongsTo(Menu, { foreignKey: 'user_id' });
Menu.hasMany(Item, { foreignKey: 'user_id' });

Item.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Item, { foreignKey: 'user_id' });

module.exports = Item;