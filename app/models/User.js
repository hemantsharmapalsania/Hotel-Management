const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const constant = require('../config/constant');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    residency_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    mobile_number: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: constant.USER,
    },
    status: {
        type: DataTypes.ENUM(constant.ACTIVE, constant.INACTIVE),
        defaultValue: constant.ACTIVE,
    },
    country: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
    },
    state: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
    },
    district: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
    },
    pin_no: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
    },
    website: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
    },
    tin_number: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    service_tax_number: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    fax_number: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    activation_key: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    otpExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    token_version: {
        type: DataTypes.STRING,
        defaultValue: null,
    },
    is_number_verify: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true
});

module.exports = User;