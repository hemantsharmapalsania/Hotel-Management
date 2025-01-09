const express = require('express');
const fileUpload = require('express-fileupload');
const AuthController = require('../controllers/authController');
const { UserAuthentication, RoleAccess, AdminAuthentication } = require('../middlewares/authentication');
const { validateRegisterSetUp } = require('../middlewares/UserValidator/userValidation');

const router = express.Router();

// router.use(fileUpload());


router.post('/login', AuthController.login)
    .post('/resend-otp', AuthController.resendOTP)
    .post('/verify-otp', AuthController.verifyOTP)
    .get("/get-user", AdminAuthentication, AuthController.getUser)
    .get("/user-logout", AdminAuthentication, AuthController.logout)
    .patch('/setup-user-profile', UserAuthentication, validateRegisterSetUp, AuthController.setUpProfile)

    //* START MENU ROUTES *//
    .post('/create-menu', AdminAuthentication, RoleAccess(['admin']), AuthController.createMenu)
    .get('/get-menu-by-id/:menu_id', AdminAuthentication, AuthController.getMenuById)
    .get('/get-all-menus', AdminAuthentication, AuthController.getAllMenus)
    .patch('/update-menu-by-id/:menu_id', AdminAuthentication, RoleAccess(['admin']), AuthController.updateMenu)
    .delete('/delete-menu/:menu_id', AdminAuthentication, RoleAccess(['admin']), AuthController.deleteMenu)

    //* START ITEM ROUTES *//
    .post('/create-item', AdminAuthentication, RoleAccess(['admin']), AuthController.createItem)
    .get('/get-item-by-id/:item_id', AdminAuthentication, AuthController.getItemById)
    .get('/get-all-items', AdminAuthentication, AuthController.getAllItems)
    .patch('/update-item-by-id/:item_id', AdminAuthentication, RoleAccess(['admin']), AuthController.updateItem)
    .delete('/delete-item/:item_id', AdminAuthentication, RoleAccess(['admin']), AuthController.deleteItem)

    //* START KOT ROUTES *//
    .post('/create-kot', AdminAuthentication, RoleAccess(['admin']), AuthController.createKot)
    .get('/get-kot-by-id/:kot_id', AdminAuthentication, AuthController.getKotById)
    .get('/get-all-kots', AdminAuthentication, AuthController.getAllKots)
    .patch('/update-kot-by-id/:kot_id', AdminAuthentication, RoleAccess(['admin']), AuthController.updateKot)
    .delete('/delete-kot/:kot_id', AdminAuthentication, RoleAccess(['admin']), AuthController.deleteKot)

    //* START BILLING ROUTES *//
    .post('/create-bill', AdminAuthentication, RoleAccess(['admin']), AuthController.createBill)
    .get('/get-bill-by-id/:bill_id', AdminAuthentication, AuthController.getBillById)
    .get('/get-all-bills', AdminAuthentication, AuthController.getAllBills)
    .patch('/update-bill-by-id/:bill_id', AdminAuthentication, RoleAccess(['admin']), AuthController.updateBill)
    .delete('/delete-bill/:bill_id', AdminAuthentication, RoleAccess(['admin']), AuthController.deleteBill)

module.exports = router;
