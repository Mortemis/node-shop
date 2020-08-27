const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
    name: String,
    email: String,
    password: String,
    cart: {
        items: [{
            _id: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: Number
        }]
    }
});

schema.methods.addToCart = function (prod) {
    const cartProdIndex = this.cart.items.findIndex(cp => {
        return cp._id.toString() === prod._id.toString();
    });
    console.log('index : ' + cartProdIndex);
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProdIndex >= 0) {
        newQuantity = this.cart.items[cartProdIndex].quantity + 1;
        updatedCartItems[cartProdIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({ _id: prod._id, quantity: newQuantity })
    }
    console.log('new qty : ' + newQuantity);

    this.cart = { items: updatedCartItems };
    return this.save();
}

schema.methods.getCart = function () {
    return this.cart;
}

schema.methods.removeFromCart = function (id) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item._id.toString() !== id.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

schema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
}

schema.methods.addOrder = function () {

}

module.exports = mongoose.model('User', schema);
// class User {
//     constructor(username, email, cart, _id) {
//         this.name = username;
//         this.email = email;
//         this.cart = cart; // {items: []}
//         this._id = _id;
//     }

//     async addToCart(prod) {

//     }

//     async removeFromCart(id) {
//         const updatedCartItems = this.cart.items.filter(i => {
//             return id.toString() !== i._id.toString();
//         });
//         await crud.update({ cart: { items: updatedCartItems }}, this._id);
//     }

//     async getCart() {
//         return this.cart;
//     }

//     async getOrder() {
//     }

//     async save() {
//         await crud.save(this);
//     }

//     async update(id) {
//         await crud.update(this, id);
//     }

//     static async fetch(id) {
//         return await crud.fetch(id);
//     }

//     static async fetchMany(ids) {
//         await crud.fetchMany(ids);
//     }

//     static async fetchAll() {
//         return await crud.fetchAll();
//     }

//     static async delete(id) {
//         await crud.delete(id);
//     }


// }

// module.exports = User;
