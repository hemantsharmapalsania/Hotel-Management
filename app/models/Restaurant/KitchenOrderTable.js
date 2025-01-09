const { DataTypes } = require('sequelize');
const User = require('../User');
const sequelize = require('../../config/database');
const Menu = require('./Menu');
const Item = require('./Item');

const KitchenOrderTable = sequelize.define('KitchenOrderTable', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    kot_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    kot_place: {
        type: DataTypes.ENUM('table_no', 'room_no'),
        allowNull: false,
    },
    kot_place_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    kot_date_and_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Item,
            key: 'id'
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    tax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    timestamps: true
});

KitchenOrderTable.belongsTo(Item, { foreignKey: 'user_id' });
Item.hasMany(KitchenOrderTable, { foreignKey: 'user_id' });

KitchenOrderTable.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(KitchenOrderTable, { foreignKey: 'user_id' });

module.exports = KitchenOrderTable;