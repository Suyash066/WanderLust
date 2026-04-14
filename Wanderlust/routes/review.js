const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

// Post Review Route
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let currListing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    currListing.reviews.push(newReview);
    console.log(newReview);
    await newReview.save();
    await currListing.save();

    console.log("new review saved");
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${ id }`);
}));

// Delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    Listing.findByIdAndUpdate(id, { $pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${ id }`);
}));

module.exports = router;