const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
    title: String,
    price: Number,
    imageurl: String,
    desc: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Product', schema)




// const Crud = require('../util/crud');
// const crud = new Crud('products');

// class Product {
//     constructor(title, price, desc, imageurl, userId) {
//         this.title = title;
//         this.price = price;
//         this.desc = desc;
//         this.imageurl = imageurl;
//         this.userId = userId;
//     }

//     async save() {
//         await crud.save(this);
//     }

//     async update(id) {
//         return await crud.update(this, id);
//     }

//     static async fetch(id) {
//         return await crud.fetch(id);
//     }

//     static async fetchMany(ids) {
//         return await crud.fetchMany(ids);
//     }

//     static async fetchAll() {
//         return await crud.fetchAll();
//     }

//     static async delete(id) {
//         await crud.delete(id);
//     }
// }


// module.exports = Product;