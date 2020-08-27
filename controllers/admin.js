const { validationResult } = require('express-validator');

const Product = require('../models/product');
const file = require('../util/file');

exports.getAddProd = (req, res) => {
    res.render('admin/add-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
        oldInput: {
            title: '',
            price: '',
            imageurl: '',
            desc: ''
        }
    });
};

exports.postProd = async (req, res, next) => {
    const image = req.file;
    const prodData = {
        title: req.body.title,
        price: req.body.price,
        desc: req.body.desc,
        imageurl: image.path.substr(7),
        userId: req.user
    }

    if (!image) {
        return res.render('admin/add-product', {
            pageTitle: 'Add product',
            path: '/admin/add-product',
            oldProduct: prodData
        });
    }
    console.log(prodData.imageurl);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors);
        return res.render('admin/add-product', {
            pageTitle: 'Add product',
            path: '/admin/add-product',
            oldProduct: prodData
        });
    }

    try {
        const product = new Product(prodData);
        await product.save();
        console.log(`[Prod created] > ${req.body.title}`);
        res.redirect('/admin/products');
    } catch (err) { next(new Error(err).statusCode = 500) }
}

exports.getEditProd = async (req, res, next) => {
    const id = req.params.id;
    Product.findById(id)
        .then(product => {
            res.render('admin/edit-product', {
                pageTitle: `Edit product: ${product.title}`,
                path: '/admin/edit-product',
                product: product
            });
        }).catch(err => next(new Error(err).statusCode = 500));
};

exports.postEditProd = async (req, res, next) => {
    const id = req.params.id;
    const image = req.file;


    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('admin/edit-product', {
            pageTitle: `Edit product: ${product.title}`,
            path: '/admin/edit-product',
            product: {
                title: req.body.title,
                price: req.body.price,
                desc: req.body.desc,
                imageurl: req.body.imageurl
            }
        });
    }

    try {
        const prod = await Product.findById(id).exec();

        if (prod.userId.toString() !== req.user._id.toString()) return res.redirect('/admin/products');

        prod.title = req.body.title;
        prod.price = req.body.price;
        prod.desc = req.body.desc;
        if (image) {
            file.deleteFile('public\\' + product.imageurl);
            prod.imageurl = image.path.substr(7);
        }

        await prod.save();
    } catch (err) { next(new Error(err).statusCode = 500) }

    res.redirect('/admin/products');
};

exports.deleteProduct = async (req, res, next) => {
    console.log('[Delete] > ' + req.body.id);
    try {

        const product = await Product.findById(req.body.id).exec();
        await file.deleteFile('public\\' + product.imageurl);
        await Product.deleteOne({ _id: req.body.id, userId: req.user._id }).exec();
    } catch (err) { next(new Error(err).statusCode = 500) }

    res.redirect('/admin/products');
};

exports.getProducts = async (req, res, next) => {
    Product.find({ userId: req.user._id })
        .then(prods => {
            res.render('admin/product-list', {
                pageTitle: 'Admin products',
                path: '/admin/products',
                prods: prods,
            });
        })
        .catch(err => next(new Error(err).statusCode = 500));
};