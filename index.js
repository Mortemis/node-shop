// 3rd party imports
const path = require('path');
const express = require('express');
const parser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const session = require('express-session');
const uuid = require('uuid');
const csrf = require('csurf');
const MongoSessionStore = require('connect-mongodb-session')(session);

// Routing/controller imports
const adminRouter = require('./routes/admin');
const shopRouter = require('./routes/shop');
const authRouter = require('./routes/auth');
const errorController = require('./controllers/error');

// Mongoose
const User = require('./models/user');
const e = require('express');

const config = require('./config.json');

// Const 
const MONGO_URI = config.mongo_URI;

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `public/images`);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/bmp') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

// Express
const app = express();
const store = new MongoSessionStore({
    uri: MONGO_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

// Setting view engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middlewares
app.use(parser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use(session({
    secret: 'long string value',
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.use(csrfProtection);

// Setting user in req.user if auth
app.use(async (req, res, next) => {
    if (!req.session.user) {
        return next();
    }

    try {
        const user = await User.findById(req.session.user._id).exec();
        if (!user) return next();
        req.user = user;
    } catch (err) {
        next(new Error(err));
    } finally {
        next();
    }
    // User.findById(req.session.user._id)
    //     .then(user => {
    //         req.user = user;
    //         next();
    //     })
    //     .catch(err => console.log(`[ERROR] + ${err}`));
});

// Insert isAuth and csrf token in render options
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    res.locals.errorMsg = '';
    next();
});

// Root routes
app.use('/admin', adminRouter);
app.use('/shop', shopRouter);
app.use(authRouter);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.redirect('/shop/products/'));
app.get('*', errorController.notFound404);

app.use((error, req, res, next) => errorController.error500(error, req, res));

// Stops deprecated complaining
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(MONGO_URI)
    .then(() => {
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`[App started] Port: ${port}`);
        });
    })
    .catch((err) => {
        console.log(`[ERROR] > ` + err);
    });
