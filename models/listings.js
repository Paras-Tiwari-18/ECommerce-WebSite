const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingsSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: { type: String, required: true }
      },
    location: String,
    country: String,
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "Review" 
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"Shopkeeper"
    },
    category:{
        type: String,
        enum:["Grocery","Electronics","Fashion","Stationary","Gifts","Flowers","Sports"]
    },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product"
        }
    ]
});

const Listings = mongoose.model("Listings", listingsSchema);
module.exports = Listings;
