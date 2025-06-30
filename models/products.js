const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productsSchema = new Schema({
    category:{
        type:String,
        enum:["Grocery","Electronics","Fashion","Stationary","Gifts","Flowers","Sports"]
    },
    name:{
        type:String,
        required:true,
    },
    brand:{
        type:[String],
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    descriptions:[
        {
            type:Schema.Types.ObjectId,
            ref: "Description"

        }
    ]
    
});

module.exports = mongoose.model("Product", productsSchema);