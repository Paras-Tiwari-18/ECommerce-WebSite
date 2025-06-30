const mongoose = require("mongoose");
const Listings = require("../models/listings");
const Product = require("../models/products");
const Shopkeeper = require("../models/shopkeeper");
// module.exports.index = async (req, res) => {
//     const allListings = await Listings.find({});
//     res.render("listings/index", { allListings });
// };
module.exports.index = async (req, res) => {
    try {
        const { category } = req.query; // Get category from query params
        let query = {};

        if (category) {
            query.category = category; // Filter listings by category
        }
        const allListings = await Listings.find(query);
        res.render("listings/index", { allListings, selectedCategory: category || "" });
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong.");
        res.redirect("/listings");
    }
};


module.exports.renderNewForm=async(req,res)=>{
    res.render("listings/new.ejs");// Render the "new.ejs" template for listings
};

//show listing
module.exports.ShowListing = async (req, res) => {
    try {
        let { id } = req.params;
        // Ensure the ID is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("error", "Invalid listing ID.");
            return res.redirect("/listings");
        }
        // Get the listing info related to reviews and owner
        //populate working
        const listing = await Listings.findById(id).populate({
            path:"reviews",
            populate:{
                path:"author"
            },
        })
        .populate("owner")
        .populate("products");
        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }
        res.render("listings/show", { listing });
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong. Please try again.");
        res.redirect("/listings");
    }
};

//create listing
// module.exports.createListing = async (req, res) => {
//     const newListing = new Listings(req.body.listing);
//     newListing.owner = req.user._id;
//     await newListing.save();
//     req.flash("success", "Successfully created a new listing");
//     res.redirect('/productListing');

// };
// module.exports.createListing = async (req, res) => {
//     const existing_owner=await Listings.findOne({owner:req.user._id});
//     if(existing_owner)
//     {
//         req.flash("success", "You have already created a listing continue filling product details");
//         res.redirect('/listings/product');
//     }
//     const newListing = new Listings(req.body.listing);
//     newListing.owner = req.user._id;
//     console.log(req.user._id);
//     await newListing.save();
    
//     req.flash("success", "Successfully created a new listing");
//     res.redirect('/productListing');
// };

module.exports.createListing = async (req, res) => {
    console.log("User session:", req.user);  // Debugging
    const newListing = new Listings(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();

    req.flash("success", "Successfully created a new listing");
    res.redirect('/productListing');
};


//edit listing form display
module.exports.editForm=async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listings.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }

        res.render("listings/edit", { listing });
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong. Please try again.");
        res.redirect("/listings");
    }
};

// update listing
module.exports.updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, url, country, location } = req.body;

        const updatedListing = {
            title,
            description,
            url,
            country,
            location
        };

        const listing = await Listings.findByIdAndUpdate(id, updatedListing, { new: true });

        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        req.flash("success", "Successfully updated the listing");
        res.redirect(`/listing/${id}`);
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong while updating the listing");
        res.redirect("/listings");
    }
};
