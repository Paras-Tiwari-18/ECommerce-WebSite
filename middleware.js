const Listings = require("./models/listings.js");
const Reviews=require("./models/reviews.js");
// Middleware to check if the user is logged in
// ✅ Middleware to check if a User is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.constructor.modelName !== "User") {
        req.session.redirectTo = req.originalUrl; // Save the original URL to session
        req.flash("error", "You must be signed in as a User to access this page.");
        return res.redirect("/login"); // Redirect User to login page
    }
    next(); // Proceed if authenticated
};

// ✅ Middleware to check if a Shopkeeper is logged in
module.exports.isLoggedInShopkeeper = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.constructor.modelName !== "Shopkeeper") {
        req.session.redirectTo = req.originalUrl; // Save the original URL to session
        req.flash("error", "You must be signed in as a Shopkeeper to access this page.");
        return res.redirect("/bazaar/shopkeeperlogin"); // Redirect Shopkeeper to login page
    }
    next(); // Proceed if authenticated
};

// Middleware to save the redirect URL into locals
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectTo) {
        res.locals.redirectUrl = req.session.redirectTo;
        delete req.session.redirectTo; // Clear the redirect URL after saving
    }
    next();      
};
//Middleware to authorise person to edit create the listing
//we can control the access by alowing only owner to update and showing button to all
module.exports.isOwner  = async(req,res,next)=>{
    let {id} = req.params;
    let listing = await Listings.findById(id);
    if(!listing.owner.equals(res.locals.currentShopkeeper._id))
    {
        req.flash("error","No Access");
        return res.redirect(`/listing/${id}`);
    }
    next();
}
// Middleware for review authorization
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Reviews.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found.");
        return res.redirect(`/listing/${id}`);
    }
    if (!review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "No Access");
        return res.redirect(`/listing/${id}`);
    }
    next();
};