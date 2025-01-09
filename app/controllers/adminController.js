const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const User = require('../models/User');
const AuthService = require('../services/adminService');
const catchAsync = require('../utils/catchAsync');

class AuthController {
    static login = catchAsync(async (req, res) => {
        const user = await AuthService.login(req, res);
        res.status(200).json({ status: true, message: 'Logged in successfully', token: user.token });
    });

    static sendOTP = catchAsync(async (req, res) => {
        const { email = null, phone_number = null } = req.body;
        const response = await AuthService.sendOTP(email, phone_number);

        res.status(200).json(response);
    });

    static verifyOTP = catchAsync(async (req, res) => {
        const { user, token } = await AuthService.verifyOTP(req, res);

        res.status(200).json({
            status: true,
            message: 'Login successfully',
            result: {
                id: user.id,
                phone_number: user.phone_number,
                role: user.role,
                createdAt: user.createdAt,
                token: token
            }
        });
    });

    static getUser = catchAsync(async (req, res) => {
        const user = await User.findOne({
            where: { id: req.user.id },
            attributes: ['id', 'phone_number', 'role', 'status']
        });
        res.status(200).json({ status: true, result: user.dataValues });
    })

    static logout = catchAsync(async (req, res) => {
        await User.update({ token_version: null }, { where: { id: req.user.id } });
        res.clearCookie('auth_token')
        res.status(200).json({ message: 'Logout successful' });
    })

    static registerUser = catchAsync(async (req, res) => {
        const response = await AuthService.registerUser(req, res);
        res.status(200).json(response)
    })

    static setupUserProfile = catchAsync(async (req, res) => {
        const response = await AuthService.setupUserProfile(req, res);
        res.status(200).json(response)
    })

    static sendOTPToVerifyNumber = catchAsync(async (req, res) => {
        const response = await AuthService.sendOTPToVerifyNumber(req.body.phone_number);
        res.status(200).json({ status: response.status, message: response.message, result: response.response })
    })

    //* START DISTRICT *//
    static addDistrict = catchAsync(async (req, res) => {
        const district = await AuthService.addDistrict(req, res);
        res.status(201).json(district);
    })

    static getDistricts = catchAsync(async (req, res) => {
        const districts = await AuthService.getDistricts(req, res);
        res.status(200).json(districts);
    })

    static updateDistrict = catchAsync(async (req, res) => {
        const district = await AuthService.updateDistrict(req, res);
        res.status(200).json(district);
    })

    static deleteDistrict = catchAsync(async (req, res) => {
        const district = await AuthService.deleteDistrict(req, res);
        res.status(200).json(district);
    })
}

module.exports = AuthController;
