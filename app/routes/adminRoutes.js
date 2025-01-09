const express = require('express');
const fileUpload = require('express-fileupload');
const AuthController = require('../controllers/adminController');
const { AdminAuthentication } = require('../middlewares/authentication');
const { validateLoginUser, validateRegisterSetUp } = require('../middlewares/UserValidator/userValidation');

const router = express.Router();

router.use(fileUpload());

//* Start of User Profile Routes *//
router.post('/login', AuthController.login)
    .post('/resend-otp', AuthController.sendOTP)
    .post('/verify-otp', AuthController.verifyOTP)
    .get("/get-user", AdminAuthentication, AuthController.getUser)
    .get("/user-logout", AdminAuthentication, AuthController.logout)
    .post('/register-user', AdminAuthentication, AuthController.registerUser)
    .patch('/update-user-profile', AdminAuthentication, validateRegisterSetUp, AuthController.setupUserProfile)

module.exports = router;
