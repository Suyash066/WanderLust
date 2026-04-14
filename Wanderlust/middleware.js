const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const wrapAsync = require("./utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //redirect URL
        req.session.redirectUrl = req.originalUrl;
        req.flash("failure", "You must be logged in to create a Listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Review.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("failure", "You  are not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
});

module.exports.isReviewAuthor = wrapAsync(async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("failure", "You  are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
});

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if(error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
};