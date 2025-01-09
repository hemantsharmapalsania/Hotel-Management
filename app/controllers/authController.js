const User = require('../models/User');
const AuthService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

class AuthController {
    static login = catchAsync(async (req, res) => {
        const user = await AuthService.login(req, res);
        res.status(200).json({ status: true, message: 'Logged in successfully', token: user.token });
    });

    static resendOTP = catchAsync(async (req, res) => {
        const { email = null, phone_number = null } = req.body;
        const response = await AuthService.resendOTP(email, phone_number);

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

    static sendOTPToVerifyNumber = catchAsync(async (req, res) => {
        const response = await AuthService.sendOTPToVerifyNumber(req.body.phone_number);
        res.status(200).json({ status: response.status, message: response.message, result: response.response })
    })

    static setUpProfile = catchAsync(async (req, res) => {
        const user = await AuthService.setupUserProfile(req, res);
        res.status(201).json(user);
    });

    //* START MENU CONTROLLER *//
    static createMenu = catchAsync(async (req, res) => {
        const user = await AuthService.createMenu(req, res);
        res.status(201).json(user);
    })

    static getMenuById = catchAsync(async (req, res) => {
        const item = await AuthService.getMenuById(req, res);
        res.status(200).json(item);
    })

    static getAllMenus = catchAsync(async (req, res) => {
        const item = await AuthService.getAllMenus(req, res);
        res.status(200).json(item);
    })

    static updateMenu = catchAsync(async (req, res) => {
        const item = await AuthService.updateMenu(req, res);
        res.status(200).json(item);
    })

    static deleteMenu = catchAsync(async (req, res) => {
        const item = await AuthService.deleteMenu(req, res);
        res.status(200).json(item);
    })

    //* START ITEM CONTROLLER *//
    static createItem = catchAsync(async (req, res) => {
        const item = await AuthService.createItem(req, res);
        res.status(201).json(item);
    })

    static getItemById = catchAsync(async (req, res) => {
        const item = await AuthService.getItemById(req, res);
        res.status(200).json(item);
    })

    static getAllItems = catchAsync(async (req, res) => {
        const item = await AuthService.getAllItems(req, res);
        res.status(200).json(item);
    })

    static updateItem = catchAsync(async (req, res) => {
        const item = await AuthService.updateItem(req, res);
        res.status(200).json(item);
    })

    static deleteItem = catchAsync(async (req, res) => {
        const item = await AuthService.deleteItem(req, res);
        res.status(200).json(item);
    })

    //* START KOT CONTROLLERS *//
    static createKot = catchAsync(async (req, res) => {
        const item = await AuthService.createKot(req, res);
        res.status(201).json(item);
    })

    static getKotById = catchAsync(async (req, res) => {
        const item = await AuthService.getKotById(req, res);
        res.status(200).json(item);
    })

    static getAllKots = catchAsync(async (req, res) => {
        const item = await AuthService.getAllKots(req, res);
        res.status(200).json(item);
    })

    static updateKot = catchAsync(async (req, res) => {
        const item = await AuthService.updateKot(req, res);
        res.status(200).json(item);
    })

    static deleteKot = catchAsync(async (req, res) => {
        const item = await AuthService.deleteKot(req, res);
        res.status(200).json(item);
    })

    //* START BILLING CONTROLLER *//
    static createBill = catchAsync(async (req, res) => {
        const item = await AuthService.createBill(req, res);
        res.status(201).json(item);
    })

    static getBillById = catchAsync(async (req, res) => {
        const item = await AuthService.getBillById(req, res);
        res.status(200).json(item);
    })

    static getAllBills = catchAsync(async (req, res) => {
        const item = await AuthService.getAllBills(req, res);
        res.status(200).json(item);
    })

    static updateBill = catchAsync(async (req, res) => {
        const item = await AuthService.updateBill(req, res);
        res.status(200).json(item);
    })

    static deleteBill = catchAsync(async (req, res) => {
        const item = await AuthService.deleteBill(req, res);
        res.status(200).json(item);
    })
}

module.exports = AuthController;
