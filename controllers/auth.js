const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/user');

//TODO error handling in routes

/**
 * Get login page
 * @param {*} req Express request
 * @param {*} res Express response
 */
exports.getLogin = (req, res) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        error: req.query.err,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
}

exports.getSignUp = (req, res) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Sign Up',
        error: req.query.err,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
}

exports.postLogin = async (req, res) => {
    // Parsing form data
    const email = req.body.email;
    const password = req.body.password;

    // Finding user in a database by email
    const user = await User.findOne({ email: email }).exec();
    if (!user) return res.redirect('/login?err=email');

    // Input validation
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            error: req.query.err,
            errorMsg: errors.errors[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.errors
        });
    }

    try {
        // Compare pwd hashes
        const pwdDoMatch = await bcrypt.compare(password, user.password);

        if (pwdDoMatch) {
            // Authenticate user and redirect to shop
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(() => {
                res.redirect('/shop/')
            });
        } else {
            res.redirect('/login?err=password');
        }
    } catch (error) {
        res.redirect('/login?err=other');
        console.log(err);
    }
}

/**
 * Process a sign up form submit
 */
exports.postSignUp = async (req, res, next) => {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const confirm = req.body.confirm;

    // Input validation
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Sign Up',
            error: req.query.err,
            errorMsg: errors.errors[0].msg,
            oldInput: {
                email: email,
                name: name,
                password: password,
                confirm: confirm
            },
            validationErrors: errors.errors
        });
    }

    try {
        const hash = await bcrypt.hash(password, 12);
        const userItm = await User.findOne({ email: email }).exec();

        if (userItm) return res.redirect('/signup?err=email');
        if (password !== confirm) return res.redirect('/signup?err=password');

        const user = new User({
            email: email,
            name: name,
            password: hash,
            cart: { items: [] }
        });
        await user.save();

        res.redirect('/login');
    } catch (err) { next(new Error(err).statusCode = 500) };
}

exports.postLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/shop/');
    });
}
