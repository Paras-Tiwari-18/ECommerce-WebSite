// const Joi = require("joi");

// module.exports.listingsSchema = Joi.object({
//     listing:Joi.object({
//         title:Joi.string().required(),
//         description:Joi.string().required(),
//         location:Joi.string().required(),
//         country:Joi.string().required(),
//         price:Joi.number().required().min(0),
//         image:Joi.string().allow("",null),
//     }).required(),
// });


//if want for particular location only then 
// const Joi = require("joi");

// module.exports.listingsSchema = Joi.object({
//     listing: Joi.object({
//         title: Joi.string().required(),
//         description: Joi.string().required(),
//         location: Joi.string().valid("Lucknow").required(), // Location must be "Lucknow"
//         country: Joi.string().valid("India").required(),    // Country must be "India"
//         price: Joi.number().required().min(0),
//         image: Joi.string().allow("", null),
//     }).required(),
// });
const Joi = require("joi");

module.exports.reviewsSchema = Joi.object({
    reviews:Joi.object({
        rating:Joi.number().required(),
        comment:Joi.string().required(),
    }).required(),
});
