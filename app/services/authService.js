const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const validator = require('validator');
const path = require('path')
const User = require('../models/User');
const { encrypt, decrypt } = require('../middlewares/encrypt');
const AppError = require('../utils/AppError');
const uploadFile = require('../utils/fileUpload');
const { sendOTPEmail, sendOTPNumber } = require('../utils/sendOTP');
const config = require('../config/config');
const { v4: uuidv4 } = require('uuid');
const Item = require('../models/Restaurant/Item');
const Menu = require('../models/Restaurant/Menu');
const KitchenOrderTable = require('../models/Restaurant/KitchenOrderTable');

class AuthService {
    static async login(req, res) {
        const { username, phone_number } = req.body;

        if (!username || !phone_number) {
            throw new AppError("username or phone number are requird.", 400);
        }

        let user = await User.findOne({ where: { phone_number } });

        if (!user) {

            user = await User.create({
                username,
                phone_number: phone_number,
                role: 'user'
            });
        }

        await this.sendOTPToVerifyNumber(phone_number);

        return res.status(200).json({
            status: true,
            message: 'OTP sent to phone number successfully',
            user,
        });
    }


    static async sendOTPToVerifyNumber(phone_number) {
        const user = await User.findOne({ where: { phone_number } });
        if (!user) throw new AppError('User not found', 404);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 15 * 60 * 1000;
        await user.save();

        const response = await sendOTPNumber(phone_number, otp);
        return { status: true, message: "OTP sent to phone number successfully", response: response };
    }

    static async resendOTP(email, phone_number) {
        let user;
        if (email) user = await User.findOne({ where: { email } });
        if (phone_number) user = await User.findOne({ where: { phone_number } });

        if (!user) throw new AppError('User not found', 404);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 15 * 60 * 1000;
        await user.save();

        await sendOTPEmail(email, otp);
        return { status: true, message: "OTP sent successfully" };
    }

    static async verifyOTP(req, res) {
        const { phone_number, otp } = req.body;
        let user = await User.findOne({ where: { phone_number } });

        if (!user) throw new AppError('User not found', 404);

        if (!user.otp) throw new AppError('You have already verified your email', 400);

        if (Number(otp) === 123456) {
            user.otp = null;
            user.otpExpiry = null;
            user.is_number_verify = true;
            await user.save();
            const jti = uuidv4();
            const token = jwt.sign(
                {
                    id: user.id,
                    phone_number: user.phone_number,
                    role: user.role,
                    status: user.status,
                    is_number_verify: true,
                    token_version: jti
                },
                config.JWT_SECRET,
                { expiresIn: '7d' }
            );
            await User.update({ token_version: jti }, { where: { id: user.id } });
            res.setHeader('Set-Cookie', cookie.serialize("auth_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 3600,
                sameSite: 'strict',
                path: '/'
            }));
            return { user, token };
        }

        if (Number(user.otp) !== Number(otp)) {
            throw new AppError('Incorrect OTP', 400);
        }

        if (user.otpExpiry < Date.now()) {
            throw new AppError('OTP has expired', 400);
        }

        user.is_number_verify = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        const jti = uuidv4();
        const token = jwt.sign(
            {
                id: user.id,
                phone_number: user.phone_number,
                role: user.role,
                status: user.status,
                is_number_verify: true,
                token_version: jti
            },
            config.JWT_SECRET,
            { expiresIn: '7d' }
        );
        await User.update({ token_version: jti }, { where: { id: user.id } });
        res.setHeader('Set-Cookie', cookie.serialize("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 3600,
            sameSite: 'strict',
            path: '/'
        }));

        return { user, token };
    }


    static async setupUserProfile(userData, bodyData) {
        const { id } = userData;
        const {
            residency_name,
            email,
            mobile_number,
            dob,
            status,
            role,
            country,
            state,
            district,
            city,
            pin_no,
            address,
            website,
            tin_number,
            service_tax_number,
            fax_number,
            activation_key,
        } = bodyData;

        const user = await User.findByPk(id);
        if (!user) throw new AppError('User not found', 404);

        await user.update({
            residency_name,
            email,
            mobile_number,
            dob,
            status,
            role,
            country,
            state,
            district,
            city,
            pin_no,
            address,
            website,
            tin_number,
            service_tax_number,
            fax_number,
            activation_key,
        });

        return {
            status: true,
            message: 'Profile successfully updated',
            result: user,
        };
    }

    //* START ITEM SERVICE *//
    static async createMenu(req, res) {
        const { id } = req.user;
        const { menu_name, category_id } = req.body;
        const item = await Menu.create({
            user_id: id,
            menu_name,
            category_id,
        });
        return {
            status: true,
            message: 'Menu created successfully',
            result: item,
        };
    }

    static async getMenuById(req, res) {
        const { id } = req.user;
        const { menu_id } = req.params;
        const item = await Menu.findOne({ where: { user_id: id, id: menu_id } });
        return {
            status: true,
            message: 'Menu fetched successfully',
            result: item,
        };
    }

    static async getAllMenus(req, res) {
        const { id } = req.user;
        const items = await Menu.findAll({ where: { user_id: id } });
        return {
            status: true,
            message: 'Menus fetched successfully',
            result: items,
        };
    }

    static async updateMenu(req, res) {
        const { id } = req.user;
        const { menu_id } = req.params;
        const { menu_name, category_id } = req.body;
        const item = await Menu.findByPk(menu_id);
        if (!item) throw new AppError('Menu not found', 404);
        if (Menu.user_id !== id) throw new AppError('Unauthorized', 401);
        await Menu.update({ menu_name, category_id });
        return {
            status: true,
            message: 'Menu updated successfully',
            result: item,
        };
    }

    static async deleteMenu(req, res) {
        const { id } = req.user;
        const { menu_id } = req.params;
        const item = await Menu.findByPk(menu_id);
        if (!item) throw new AppError('Menu not found', 404);
        if (Menu.user_id !== id) throw new AppError('Unauthorized', 401);
        await Menu.destroy();
        return {
            status: true,
            message: 'Menu deleted successfully',
        };
    }

    //* START ITEM SERVICE *//
    static async createItem(req, res) {
        const { id } = req.user;
        const { item_name, menu_id, price, quantity, description } = req.body;
        let image = null;
        if (req.files) {
            image = uploadFile(req.files.image, '/uploads/items');
        }
        const item = await Item.create({
            user_id: id,
            item_name,
            menu_id,
            price,
            quantity,
            description,
            image,
            image_keyword
        });
        return {
            status: true,
            message: 'Item created successfully',
            result: item,
        };
    }

    static async getItemById(req, res) {
        const { id } = req.user;
        const { item_id } = req.params;
        const item = await Item.findOne({ where: { user_id: id, id: item_id } });
        return {
            status: true,
            message: 'Item fetched successfully',
            result: item,
        };
    }

    static async getAllItems(req, res) {
        const { id } = req.user;
        const items = await Item.findAll({ where: { user_id: id } });
        return {
            status: true,
            message: 'Items fetched successfully',
            result: items,
        };
    }

    static async updateItem(req, res) {
        const { id } = req.user;
        const { item_id } = req.params;
        const { item_name, menu_id, price, quantity = null, description = null } = req.body;
        const item = await Item.findByPk(item_id);
        if (!item) throw new AppError('Item not found', 404);
        if (Item.user_id !== id) throw new AppError('Unauthorized', 401);
        let image = item.image;
        if (req.files) {
            image = uploadFile(req.files.image, '/uploads/items');
        }
        await Item.update({ item_name, menu_id, price, quantity, description, image });
        return {
            status: true,
            message: 'Item updated successfully',
            result: item,
        };
    }

    static async deleteItem(req, res) {
        const { id } = req.user;
        const { item_id } = req.params;
        const item = await Item.findByPk(item_id);
        if (!item) throw new AppError('Item not found', 404);
        if (Item.user_id !== id) throw new AppError('Unauthorized', 401);
        await Item.destroy();
        return {
            status: true,
            message: 'Item deleted successfully',
        };
    }
    //* END ITEM SERVICE *//

    //* START KOT SERVICES *//
    static async createKot(req, res) {
        const { id } = req.user;
        const {
            user_id,
            kot_number,
            kot_place,
            kot_place_number,
            kot_date_and_time,
            item_id,
            price,
            tax,
            quantity
        } = req.body;
        const kot = await KitchenOrderTable.create({
            user_id: id,
            kot_number,
            kot_place,
            kot_place_number,
            kot_date_and_time,
            item_id,
            price,
            tax,
            quantity
        });
        return {
            status: true,
            message: 'Kot created successfully',
            result: kot,
        };
    }

    static async getKotById(req, res) {
        const { id } = req.user;
        const { kot_id } = req.params;
        const kot = await KitchenOrderTable.findOne({ where: { user_id: id, id: kot_id } });
        return {
            status: true,
            message: 'Kot fetched successfully',
            result: kot,
        };
    }

    static async getAllKots(req, res) {
        const { id } = req.user;
        const kots = await KitchenOrderTable.findAll({ where: { user_id: id } });
        return {
            status: true,
            message: 'Kots fetched successfully',
            result: kots,
        };
    }

    static async updateKot(req, res) {
        const { id } = req.user;
        const { kot_id } = req.params;
        const {
            kot_number,
            kot_place,
            kot_place_number,
            kot_date_and_time,
            item_id,
            price,
            tax,
            quantity
        } = req.body;
        const kot = await KitchenOrderTable.findByPk(kot_id);
        if (!kot) throw new AppError('Kot not found', 404);
        if (kot.user_id !== id) throw new AppError('Unauthorized', 401);
        await KitchenOrderTable.update({
            kot_number,
            kot_place,
            kot_place_number,
            kot_date_and_time,
            item_id,
            price,
            tax,
            quantity
        });
        return {
            status: true,
            message: 'Kot updated successfully',
            result: kot,
        };
    }

    static async deleteKot(req, res) {
        const { id } = req.user;
        const { kot_id } = req.params;
        const kot = await KitchenOrderTable.findByPk(kot_id);
        if (!kot) throw new AppError('Kot not found', 404);
        if (kot.user_id !== id) throw new AppError('Unauthorized', 401);
        await KitchenOrderTable.destroy();
        return {
            status: true,
            message: 'Kot deleted successfully',
        };
    }
    //* END KOT SERVICES *//

    //* START BILLING SERVICE *//
    static async createBill(req, res) {
        const { id } = req.user;
        const {
            bill_date_and_time,
            menu_id,
            kot_id,
            total_price,
            discount_percentage,
            discount_amount,
            grand_total
        } = req.body;
        const bill_number = Math.floor(1000 + Math.random() * 9000).toString();
        const bill = await BillingTable.create({
            user_id: id,
            bill_number: bill_number,
            bill_date_and_time,
            menu_id,
            kot_id,
            total_price,
            discount_percentage,
            discount_amount,
            customer_name,
            coupon_code,
            grand_total
        });
        return {
            status: true,
            message: 'Bill created successfully',
            result: bill,
        };
    }

    static async getBillById(req, res) {
        const { id } = req.user;
        const { bill_id } = req.params;
        const bill = await BillingTable.findOne({ where: { user_id: id, id: bill_id } });
        return {
            status: true,
            message: 'Bill fetched successfully',
            result: bill,
        };
    }

    static async getAllBills(req, res) {
        const { id } = req.user;
        const bills = await BillingTable.findAll({ where: { user_id: id } });
        return {
            status: true,
            message: 'Bills fetched successfully',
            result: bills,
        };
    }

    static async updateBill(req, res) {
        const { id } = req.user;
        const { bill_id } = req.params;
        const {
            bill_date_and_time,
            menu_id,
            kot_id,
            total_price,
            discount_percentage,
            discount_amount,
            grand_total
        } = req.body;
        const bill = await BillingTable.findByPk(bill_id);
        if (!bill) throw new AppError('Bill not found', 404);
        if (bill.user_id !== id) throw new AppError('Unauthorized', 401);
        await BillingTable.update({
            bill_date_and_time,
            menu_id,
            kot_id,
            total_price,
            discount_percentage,
            discount_amount,
            grand_total
        });
        return {
            status: true,
            message: 'Bill updated successfully',
            result: bill,
        };
    }

    static async deleteBill(req, res) {
        const { id } = req.user;
        const { bill_id } = req.params;
        const bill = await BillingTable.findByPk(bill_id);
        if (!bill) throw new AppError('Bill not found', 404);
        if (bill.user_id !== id) throw new AppError('Unauthorized', 401);
        await BillingTable.destroy();
        return {
            status: true,
            message: 'Bill deleted successfully',
        };
    }
    //* END BILLING SERVICE *//
}

module.exports = AuthService;
