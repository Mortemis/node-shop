const express = require('express');
const { check } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/products', isAuth, adminController.getProducts);

router.route('/add-product')
    .get(isAuth, adminController.getAddProd)
    .post(isAuth,
        check('title', 'Invalid title. Should not be empty. Should contain only letters and numbers, max 32 characters.')
            .trim()
            .isString()
            .isLength({ min: 2, max: 32 }),
        check('price', 'Price must be a number.')
            .isNumeric(),
        check('desc', 'Description must contain at least 5 characters.')
            .isLength({ min: 5 }),
        adminController.postProd
    );

router.route('/edit-product/:id')
    .get(isAuth, adminController.getEditProd)
    .post(isAuth,
        check('title', 'Invalid title. Should not be empty. Should contain only letters and numbers, max 32 characters.')
            .trim()
            .isString()
            .isLength({ min: 1, max: 32 }),
        check('price', 'Price must be a number.')
            .isNumeric(),
        check('desc', 'Description must contain at least 5 characters.')
            .isLength({ min: 5 }),
        adminController.postEditProd
    );

router.get('/edit-product/:id', isAuth, adminController.getEditProd);

router.post('/edit-product/:id', isAuth, adminController.postEditProd);

//router.post('/delete-product', isAuth, adminController.deleteProduct);

router.delete('/product/:id', isAuth, adminController.deleteProduct);

module.exports = router;
