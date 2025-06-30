//basic  setup
//npm init -y;npm i express;npmi mongoose;npm i ejs
if(process.env.NODE_ENV!=="production")
{
    require("dotenv").config();

}

const express = require("express");
const app = express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const {reviewsSchema}=require("./schema.js");
const wrapAsync = require("./utils/wrapAsync.js");
const http = require('http'); // For HTTP server
const socketio = require("socket.io"); // For Socket.io
const listingControllers=require("./controllers/listings.js");
const reviewsControllers=require("./controllers/reviews.js");
const server = http.createServer(app); // Create the server
const io = socketio(server); // Pass the server to socket.io
const sessions = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const Reviews = require("./models/reviews.js");
const Listings = require("./models/listings.js");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");//all for authentication  
const Product = require("./models/products.js");
const Shopkeeper = require("./models/shopkeeper.js");
const Description = require("./models/description.js");
const Cart=require("./models/addtocart.js")
const { isLoggedIn, saveRedirectUrl , isOwner ,isReviewAuthor, isLoggedInShopkeeper} = require('./middleware');
const { data: CategoryDataImages } = require("./public/js/data.js")

app.use(sessions({
    secret:"abcparasefgaryav",
    resave:false,
    saveUninitialized:false,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
    }
}));
app.use(flash());
//passport middleware
app.use(passport.initialize());
//a middleware for passport to use the session
app.use(passport.session());
//A web application needs ability to identify users as they browse from page to page. This series of req and res each associated with the same user is called a session.
// passport.use(new LocalStrategy(User.authenticate()));//to use local strategy to authenticate the user from passport
passport.use('user-local', new LocalStrategy(User.authenticate()));//to authenticate the user
passport.use('shopkeeper-local', new LocalStrategy(Shopkeeper.authenticate()));//to authenticate the shopkeeper

// passport.use(new LocalStrategy(Shopkeeper.authenticate()));//to authenticate the shopkeeper
passport.serializeUser((user, done) => {
    done(null, { id: user._id, type: user.constructor.modelName });
});
// When a user logs in, Passport calls the serializeUser function to decide which data of the user should be stored in the session. The data you choose to serialize here is usually a unique identifier for the user (e.g., id).

passport.deserializeUser(async (obj, done) => {
    try {
        if (obj.type === "User") {
            const user = await User.findById(obj.id);
            return done(null, user);
        } else if (obj.type === "Shopkeeper") {
            const shopkeeper = await Shopkeeper.findById(obj.id);
            return done(null, shopkeeper);
        }
        return done(new Error("No user type found"), null);
    } catch (err) {
        return done(err, null);
    }
});
// When subsequent requests are received, this ID is used to find the user, which will be restored data.


// app.use((req, res, next) => {
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     res.locals.currentUser = req.user; // Set currentUser to req.user
//     res.locals.currentShopkeeper=req.user; 
//     next();
// });
app.use(async (req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    if (req.user) {
        // Check if the logged-in user is a Shopkeeper or a User
        // const Shopkeeper = require("./models/shopkeeper");
        const shopkeeper = await Shopkeeper.findById(req.user._id);
        if (shopkeeper){
            res.locals.currentShopkeeper = shopkeeper;
            res.locals.currentUser = null; // Ensure currentUser is null when a Shopkeeper logs in
        } else {
            res.locals.currentUser = req.user;
            res.locals.currentShopkeeper = null; // Ensure currentShopkeeper is null when a User logs in
        }
    } else {
        res.locals.currentUser = null;
        res.locals.currentShopkeeper = null;
    }

    next();
});

// app.use((req, res, next) => {
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     res.locals.currentUser = req.user; // Set currentUser to req.user
//     if (res.locals.currentUser) {
//         console.log(res.locals.currentUser._id);
//     } else {
//         console.log('No user logged in');
//     }
//     next();
// });

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.json());

const Mongo="mongodb://127.0.0.1:27017/bazaar";
main()
 .then(()=>{
    console.log("connected");
 })
 .catch((err)=>{
    console.log(err)
 });

async function main() {
    mongoose.connect(Mongo);
}

//socket.io
io.on("connection",function(socket){
    socket.on("send-location",function(data){
        io.emit("receive-location",{ id:socket.id,...data});
    });
    socket.on("disconnect",function(){
        io.emit("user-disconnected",socket.id);
    });
    console.log("connected with socket");
});


app.get("/",(req,res)=>{
    res.send("This is root");
});
// const validateListing = (req,res,next)=>{
//     let {error} = listingSchema.validate(req.body);
//     if(error)
//     {
//         let errMsg = error.details.map((el)=>el.message).join(",");
//         throw new ExpressError(400,reeMsg);
//     }
//     else{
//         next();
//     }
// }
const validatereviews = (req,res,next)=>{
    let {error} = reviewsSchema.validate(req.body);
    if(error)
    {
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,reeMsg);
    }
    else{
        next();
    }
}
app.get("/listings", (listingControllers.index));
app.get("/listing/new",isLoggedInShopkeeper,(listingControllers.renderNewForm));
//show data
app.get("/listing/:id",(listingControllers.ShowListing));
// create new listing
app.post("/listing/new",isLoggedInShopkeeper,(listingControllers.createListing));
// app.post("/listing/new", async (req, res) => {
//     let { title, description, imageFilename,url, price, country, location } = req.body;
//     let newlisting = new Listings({
//         title: title,
//         description: description,
//         image:{ filename: imageFilename, url:url},
//         price: price,
//         country: country,
//         location: location,
//     });

//     newlisting
//         .save()
//         .then(() => {
//             console.log("Listing was saved");
//             res.redirect("/listings");
//         })
//         .catch((err) => {
//             console.log(err);
//             res.status(500).send("Error saving the listing");
//         });
// });

// app.get("/listing/:id/edit",isLoggedIn,async(req,res)=>{
//     let {id}=req.params;
//     const listing=await Listings.findById(id);
//     res.render("listings/edit",{listing});
// });

app.get("/listing/:id/edit",isLoggedInShopkeeper, (listingControllers.editForm));
//update rout
app.put("/listing/:id", isOwner, (listingControllers.updateListing));

//reviews
// app.post("/listings/:id/review",isLoggedIn,async(req,res)=>{
//     let listing=await Listings.findById(req.params.id);
//     let newreview=new Reviews(req.body.review);

//     listing.reviews.push(newreview);

//     await newreview.save();
//     await listing.save();

//     console.log("Sved");
//     req.flash("success","Successfully created a new review");
//     res.redirect(`/listing/${listing._id}`);
// });

//reviews
app.post("/listings/:id/review", isLoggedIn, (reviewsControllers.createReview));

// delete reviews
app.delete("/listings/:id/reviews/:reviewId", isLoggedIn, isReviewAuthor, (reviewsControllers.deleteReview));

// app.use((err,req,res,next)=>{
//     res.send(`Something went wrong ${err}`);
// });

app.get("/productShow", async (req, res) => {
    const products = await Product.find({});
    res.render("listings/productShow", { products, data: CategoryDataImages,owner:req.user});
});
app.get("/productListing",(req,res)=>{
    res.render("listings/product");
});
app.post("/productListing", async (req, res) => {
    try {
        // Extract selected products from request body
        const { selectedProducts } = req.body;

        // Ensure selectedProducts is already an array, if it's a string, parse it
        const selectedProductArray = 
            typeof selectedProducts === "string" ? JSON.parse(selectedProducts) : selectedProducts;

        // Convert data to match the Mongoose schema structure
        const productsToInsert = selectedProductArray.map(product => ({
            category: product.category, // Default category, change based on your logic
            name: product.product,
            brand: product.brand,
            quantity: Number(product.quantity),
            price: Number(product.price),
            image:product.image
        }));
        const listing=await Listings.findOne({owner:req.user._id});
        if(!listing)
        {
            req.flash("error","No listing found");
            return res.redirect("/listings");
        }
        // Insert into MongoDB
        const insertedProducts = await Product.insertMany(productsToInsert);
        // Add the inserted product IDs to the listing's `products` array
        listing.products.push(...insertedProducts.map(product => product._id));
        await listing.save();
        console.log("Products inserted successfully");
        res.redirect(`/descriptionProducts/${listing._id}` );

    } catch (error) {
        console.error("Error inserting products:", error);
        req.flash("error", "Error inserting products");
        res.redirect("/Listings");
    }
});
app.get("/descriptionProducts/:id",async(req,res)=>{
    const {id} = req.params;
    const listing= await Listings.findById(id).populate("products");
    res.render("listings/description",{products:listing.products});

});
app.post("/descriptionProducts", async (req, res) => {
    const { heading, description, productIds } = req.body;
    let idx = 0;  // Counter for iterating through heading and description arrays

    // Iterate through each product and its corresponding descriptions
    for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i];

        // Get the number of descriptions entered for this product from the form
        const numDescriptionsForProduct = parseInt(req.body[`numDescriptionsForProduct_${i}`]);

        // Slice heading and description arrays to match the number of descriptions for the current product
        const productHeadings = heading[i];
        const productDescriptions = description[i];

        // Create a new description document for the product
        const newDescription = new Description({
            productId: productId,
            descriptions: productHeadings.map((heading, index) => ({
                heading: heading,
                description: productDescriptions[index]
            }))
        });

        await newDescription.save();  // Save the description document
        const product = await Product.findById(productId);
        if (product) {
            product.descriptions.push(newDescription._id);
            await product.save();
        }
    }

    res.redirect("/productShow");  // Redirect to the product list or another page
});
app.get("/productDisplay/:productId", async (req, res) => {
    let { productId } = req.params;
    const product = await Product.findById(productId).populate("descriptions");
    res.render("listings/productsDescriptionShow", { product });
});



// app.post("/descriptionProducts",(req,res)=>{
//     const description = req.body;
//     console.log(description);

// })

app.get("/bazaar/shopkeeperDashboard/:shopkeeperId", isLoggedInShopkeeper, wrapAsync(async (req, res) => {
    console.log("Shopkeeper ID:", req.params.shopkeeperId);
    const { shopkeeperId } = req.params;
    const shopkeeper = await Shopkeeper.findById(shopkeeperId);
    res.render("listings/shopkeeperDashboard", { shopkeeper });
}));


//authentication routs
//signup
app.get("/signup",(req,res)=>{
    res.render("listings/usersignup");

});
//shopkeeper signup
app.get("/bazaar/shopkeepersignup",(req,res)=>{
    res.render("listings/shopkeeperSignUp");
});
app.get("/myCart",(req,res)=>{
    res.render("listings/myCart");
});
app.post("/cartAdd",async(req,res)=>{
    const {productId,quantity}=req.body;
    const userId = req.user._id;  
    
});
app.post("/signup", async (req, res) => {
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
});
app.post("/bazaar/shopkeepersignup", async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        let newShopkeeper = new Shopkeeper({ username, email });
        const registerShopkeeper = await Shopkeeper.register(newShopkeeper, password);
        console.log(registerShopkeeper);
        //once the shopkeeper is registered we will login automatically to prevent from first signup then login
        req.login(registerShopkeeper, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Account Created Successfully");
            res.redirect("/listing/new");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/bazaar/shopkeepersignup");
    }
});
//login
app.get("/login",(req,res)=>{
    res.render("listings/login");
});

app.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("user-local", {
        failureFlash: "Invalid User Name Or Password", // Enables flashing of error messages
        failureRedirect: "/login", // Redirect back to login on failure
    }),
    async (req, res) => {
        req.flash("success", "Welcome back"); // Flash a success message
        let redirectUrl = res.locals.redirectUrl || "/listings"; // Set the redirect URL
        res.redirect(redirectUrl); // Redirect on successful login
    }
);
app.get("/bazaar/shopkeeperlogin",(req,res)=>{
    res.render("listings/shopkeeperLogin");
});
//normal login of shopkeeper 
// app.post(
//     "/bazaar/shopkeeperlogin",
//     saveRedirectUrl,// middleware that saves the redirect URL for example if user was trying to use the protected url ie you cannot review without login then it would redirect you to the login page and after login it will redirect you to the page you were trying to access middleware only stores where you were trying to access rest is done by response.redirect
//     passport.authenticate("shopkeeper-local", {
//         failureFlash: "Invalid Shopkeeper's Name Or Password", // Enables flashing of error messages
//         failureRedirect: "/bazaar/shopkeeperlogin", // Redirect back to login on failure
//     }),
//     async (req, res) => {
//         req.flash("success", "Welcome back"); // Flash a success message
//         let redirectUrl = res.locals.redirectUrl || `/bazaar/shopkeeperDashboard/${req.user._id}`; // Set the redirect URL
//         res.redirect(redirectUrl); // Redirect on successful login
//     }
// );
//here in this we want to prevent the shopkeeper from creating multiple listings since when a shopkeeper goes to create a new listing he is redirected to the login page and after login he is redirected to the page which he tried to access which was listing/new now he got redirect to the listing creation but he has already created a listing now we want to redirect to the product form if the shopkeeper is already listed to do so we will have to do it in the login rout since due to midileware we are redirected here only so here what we do is check if the redirect url is listing/new and if it is then we check if the shopkeeper has already created a listing if he has then we redirect him to the product form
app.post(
    "/bazaar/shopkeeperlogin",
    saveRedirectUrl, // Middleware saves the redirect URL
    passport.authenticate("shopkeeper-local", {
        failureFlash: "Invalid Shopkeeper's Name Or Password",
        failureRedirect: "/bazaar/shopkeeperlogin",
    }),
    async (req, res) => {
        req.flash("success", "Welcome back");

        // 🚀 Log the redirect URL and user data
        console.log("Redirect URL before assignment:", res.locals.redirectUrl);
        console.log("User Session:", req.user);

        let redirectUrl = res.locals.redirectUrl || `/bazaar/shopkeeperDashboard/${req.user._id}`;
        console.log("Final Redirect URL:", redirectUrl);

        // Check if the user is authenticated
        if (!req.user) {
            req.flash("error", "You need to log in first");
            return res.redirect("/bazaar/shopkeeperlogin");
        }

        // Check if the user is trying to create a new listing
        console.log("Checking redirect URL condition:", redirectUrl === "/listing/new");

        if (redirectUrl.startsWith("/listing/new")) {
            console.log("User is trying to create a new listing");

            // Check if the Shopkeeper has already created a listing
            const existing_owner = await Listings.findOne({ owner: req.user._id });
            
            console.log("Existing Listing Found:", existing_owner);
            //if yes then redirect to the product form
            if (existing_owner) {
                req.flash("info", "You already created a listing. Continue filling product details.");
                return res.redirect('/productListing');
            }
        }

        console.log("Redirecting to:", redirectUrl);
        res.redirect(redirectUrl);
    }
);

//logout
app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            req.flash("error","Something went wrong");
            return next(err);
        }
        req.flash("success","Successfully logged out");
        res.redirect("/listings");
    });
});
server.listen(8080,()=>{
    console.log("Server active on port 8080");
});