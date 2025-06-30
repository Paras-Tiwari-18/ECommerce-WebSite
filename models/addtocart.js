const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
                min: 1 // Ensures quantity is at least 1
            }
        }
    ]
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model("Cart", cartSchema);
