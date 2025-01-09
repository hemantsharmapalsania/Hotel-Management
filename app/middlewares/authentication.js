const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

const AdminAuthentication = async (req, res, next) => {
    try {
        const header = req.cookies.auth_token && req.headers.authorization;

        if (!header) {
            return next(new AppError('Unauthorized user.', 401));
        }

        const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;
        const decoded = jwt.verify(token, config.JWT_SECRET);

        const userData = await User.findOne({ where: { id: decoded.id } });
        const user = userData && userData.dataValues ? userData.dataValues : userData;
        if (!user) next(new AppError('User not found.', 401));
        if (!user || user.token_version !== decoded.token_version) {
            return next(new AppError('Invalid token. Please log in again.', 401));
        }

        if (user.role !== 'admin' && decoded.role !== 'admin') {
            return next(new AppError('Unauthorized user.', 401));
        }

        req.user = user;
        next();

    } catch (error) {
        next(error);
    }
};


const UserAuthentication = async (req, res, next) => {
    try {
        const header = req.cookies.auth_token && req.headers.authorization;
        if (!header) {
            return next(new AppError('Unauthorized user.', 401));
        }

        const token = header.split(" ")[1]

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const userData = await User.findOne({ where: { id: decoded.id } });
        const user = userData && userData.dataValues ? userData.dataValues : userData;
        if (!user) next(new AppError('User not found.', 401));
        if (user.role === 'admin' && decoded.role === 'admin') {
            return next(new AppError('Unauthorized user.', 401));
        }
        if (!user || user.token_version !== decoded.token_version) {
            return next(new AppError('Invalid token. Please log in again.', 401));
        }
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

const RoleAccess = (requiredRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return next(new AppError('Role not found. Access denied.', 403));
            }
            console.log(req.user, requiredRoles)
            if (!requiredRoles.includes(req.user.role)) {
                return next(new AppError('You do not have permission to access this resource.', 403));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = { AdminAuthentication, UserAuthentication, RoleAccess };
