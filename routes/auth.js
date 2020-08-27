const express = require('express');
const { check } = require('express-validator');

const authController = require('../controllers/auth');

const router = express.Router();

router.route('/login')
    .get(authController.getLogin)
    .post(
        check('email', 'Enter a valid email.')
            .isEmail()
            .normalizeEmail(),
        check('password', 'Password length is at least 5 characters.')
            .isLength({ min: 5 })
            .isAlphanumeric(),
        authController.postLogin);


router.route('/signup')
    .get(authController.getSignUp)
    .post(
        check('password', 'Invalid password. Please use password with only letters or numbers and at least 5 characters.')
            .isLength({ min: 5 })
            .isAlphanumeric(),
        check('email')
            .isEmail()
            .withMessage('Enter a valid email.')
            .normalizeEmail(),
        authController.postSignUp
    );

router.post('/logout', authController.postLogout);

module.exports = router;