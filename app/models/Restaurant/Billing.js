const { DataTypes } = require('sequelize');
const User = require('../User');
const sequelize = require('../../config/database');
const Menu = require('./Menu');
const KitchenOrderTable = require('./KitchenOrderTable');

const Billing = sequelize.define('Billing', {
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
    bill_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    kot_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: KitchenOrderTable,
            key: 'id'
        }
    },
    customer_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bill_date_and_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    coupon_code: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    discount_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    grand_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: true
});

Billing.belongsTo(KitchenOrderTable, { foreignKey: 'user_id' });
KitchenOrderTable.hasMany(Billing, { foreignKey: 'user_id' });

Billing.belongsTo(Menu, { foreignKey: 'user_id' });
Menu.hasMany(Billing, { foreignKey: 'user_id' });

Billing.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Billing, { foreignKey: 'user_id' });

module.exports = Billing;