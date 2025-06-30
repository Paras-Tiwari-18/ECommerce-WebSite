const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose");
const shopkeeperSchema = new Schema({
    email:{
        type:String,
        required:true
    }
});
shopkeeperSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Shopkeeper",shopkeeperSchema);
