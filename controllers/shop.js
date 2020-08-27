
const fs = require('fs');
const path = require('path');
const PDF = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
const { exec } = require('child_process');

const ITEMS_PER_PAGE = 3;

exports.getShop = async (req, res) => {
    Product.find(products => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/shop',
        });
    });
}

exports.getCart = (req, res) => {
    console.log(req.user.cart.items);
    req.user.populate('cart.items._id')
        .execPopulate()
        .then(user => {
            res.render('shop/cart', {
                pageTitle: 'Cart',
                path: '/shop/cart',
                products: user.cart.items,
            });
        })
        .catch(err => console.log(err));
}

exports.getOrders = async (req, res) => {
    Order.find({ 'user._id': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Orders',
                path: '/shop/orders',
                orders: orders,
            });
        })
        .catch(err => console.log(err))
}

exports.addToCart = async (req, res) => {
    //Product id 
    const id = req.body._id;

    console.log(`[Add to cart] > ${id}`);

    Product.findById(id)
        .then(prod => {
            return req.user.addToCart(prod)
        })
        .then(() => {
            console.log('[Cart] Product added > ' + id);
            res.status(200).redirect('/shop/products');
        })
        .catch(err => console.log(err));
}

exports.removeFromCart = async (req, res) => {
    const id = req.body.id;
    console.log(`[Remove from cart] > ${id}`);
    req.user.removeFromCart(id)
        .then(() => {
            res.redirect('/shop/cart');
        })
        .catch(err => { '[ERROR Remove from cart] > ' + console.log(err) })
}

exports.getCheckout = (req, res) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/shop/checkout',
    });
}

exports.getProductDetail = async (req, res) => {
    const id = req.params.id;

    Product.findById(id)
        .then(prod => {
            res.render('shop/product-detail', {
                pageTitle: `Product: ${prod.title}`,
                path: `shop/details/${id}`,
                product: prod,
            });
        })
        .catch(err => console.log(err));
}

exports.getProductList = async (req, res, next) => {
    let page = +req.query.page || 1;
    try {
        const prodCount = await Product.find().countDocuments().exec();
        const products = await Product.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .exec();

        res.render('shop/product-list', {
            pageTitle: 'Products',
            path: '/shop/products',
            prods: products,
            isAuthenticated: req.session.isLoggedIn,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < prodCount,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(prodCount / ITEMS_PER_PAGE)
        });
    } catch (err) {
        next(new Error('Get product error'));
    }


    // Product.find()
    //     .skip((page - 1) * ITEMS_PER_PAGE)
    //     .limit(ITEMS_PER_PAGE)
    //     .then(products => {
    //         res.render('shop/product-list', {
    //             pageTitle: 'Products',
    //             path: '/shop/products',
    //             prods: products,
    //             isAuthenticated: req.session.isLoggedIn
    //         });
    //     })
    //     .catch(err => {
    //         next(new Error('Get product error'))
    //     });
}

exports.postOrder = async (req, res) => {
    req.user.populate('cart.items._id')
        .execPopulate()
        .then(user => {
            const prods = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i._id._doc } };
            });

            const order = new Order({
                user: {
                    email: req.user.email,
                    _id: req.user
                },
                products: prods
            });
            return order.save();

        }).then(() => {
            return req.user.clearCart();
        }).then(() => {
            res.redirect('/shop/orders')
        })
        .catch(err => console.log(err));
}

exports.getInvoice = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const order = await Order.findById(orderId).exec();
        const invoiceName = `invoice-${orderId}.pdf`;
        const invoicePath = path.join('data', 'invoices', invoiceName);

        if (order.user._id.toString() !== req.user._id.toString()) return next(new Error('Unauthorized access'));
        res.setHeader('Content-Disposition', 'inline; filename="Invoice"');
        res.setHeader('Content-Type', 'application/pdf');
        //file.pipe(res);
        const doc = new PDF();
        doc.pipe(fs.createWriteStream(invoicePath));
        doc.pipe(res);
        doc.fontSize(26).text('Invoice');
        doc.fontSize(14).text('==============================');

        let price = 0;

        for (let prod of order.products) {
            price += prod.quantity * prod.product.price;
            doc.text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`);
            doc.text('--------------------------')
        }

        doc.fontSize(20).text(`Total price: $${price}`);
        doc.end();
    } catch (err) { console.log(err); next(new Error('Error fetching invoice')) }
}

