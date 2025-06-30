const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const descriptionSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    descriptions: [
        {
            heading: String,
            description: String
        }
    ]
});

module.exports = mongoose.model("Description", descriptionSchema);

