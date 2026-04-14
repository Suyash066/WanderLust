const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs", { title: "Signup" });
});

router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });

        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) { return next(err); }
            else {
                req.flash("success", "Welcome to Wanderlust");
                console.log("user registered");
                res.redirect("/listings");
            }
        });
    } catch (err) {
        req.flash("failure", err.message);
        res.redirect("/signup");
    }
}));

router.get("/login", wrapAsync(async (req, res) => {
    res.render("users/login.ejs", { title: "Login" });
}));

router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), wrapAsync(async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust! You are logged in");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}));

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) next(err);
        else {
            req.flash("success", "You are logged out!");
            res.redirect("/listings");
        }
    });
});

module.exports = router;