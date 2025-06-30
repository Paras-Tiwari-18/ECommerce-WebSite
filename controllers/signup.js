const mongoose = require("mongoose");
const User = require("../models/user.js");

//get signup form
module.exports.getSignupForm = (req, res) => {
    res.render("listings/usersignup");
};

//post signup form
module.exports.postSignupForm = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        let newUser = new User({ username, email });
        const registerUser = await User.register(newUser, password);
        console.log(registerUser);
        //once the user is registered we will login automatically to prevent from first signup then login
        req.login(registerUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome back");
            res.redirect("/listings");   
        });
        
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};