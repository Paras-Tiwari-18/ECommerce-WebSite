const mongoose = require("mongoose");
const Reviews = require("../models/reviews.js");
const Listings = require("../models/listings");

//post reviews
module.exports.createReview = async (req, res) => {
    try {    
        // Find the listing by ID
        const listing = await Listings.findById(req.params.id);

        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }

        // Create a new review
        const newReview = new Reviews(req.body.review);
        // Set the author of the review to the current user logged in
        newReview.author = req.user._id;
        // Push the review to the listing
        listing.reviews.push(newReview);

        // Save both the review and the listing
        await newReview.save();
        await listing.save();

        req.flash("success", "Successfully created a new review");
        res.redirect(`/listing/${listing._id}`);
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong. Please try again.");
        res.redirect("/listings");
    }
};

// //delete reviews
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params; // Corrected parameter name

    try {
        // Log the review ID to debug
        console.log(`Attempting to delete review with ID: ${reviewId}`);

        // Remove the review reference from the listing
        const listing = await Listings.findByIdAndUpdate(
            id,
            { $pull: { reviews: reviewId } },
            { new: true }
        );

        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }

        // Check if the review ID is valid
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            req.flash("error", "Invalid review ID.");
            return res.redirect(`/listing/${id}`);
        }

        // Log the review ID to debug
        console.log(`Deleting review with ID: ${reviewId}`);

        // Delete the review document
        const review = await Reviews.findByIdAndDelete(reviewId);

        if (!review) {
            req.flash("error", "Review not found.");
            return res.redirect(`/listing/${id}`);
        }

        req.flash("success", "Successfully deleted the review.");
        res.redirect(`/listing/${id}`);
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong. Please try again.");
        res.redirect("/listings");
    }
};