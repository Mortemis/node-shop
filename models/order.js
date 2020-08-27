const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
    products: [{
        product: Object,
        quantity: Number
    }],
    user: {
        email: String,
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }
});

module.exports = mongoose.model('Order', schema);