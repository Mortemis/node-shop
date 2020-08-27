const express = require('express');

const router = express.Router();

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

//Shop index page
router.get('/', shopController.getShop);

//Get product details page
router.get('/details/:id', shopController.getProductDetail);

//Checkout page
router.get('/checkout', isAuth, shopController.getCheckout);

//Get orders page
router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

//Get list of products page
router.get('/products', shopController.getProductList);

//Get cart page
router.get('/cart', isAuth, shopController.getCart);

//Add product to cart
router.post('/cart', isAuth, shopController.addToCart);

//Remove from cart
router.post('/cartremove', isAuth, shopController.removeFromCart);

//Post an order;
router.post('/create-order', isAuth, shopController.postOrder);

module.exports = router;