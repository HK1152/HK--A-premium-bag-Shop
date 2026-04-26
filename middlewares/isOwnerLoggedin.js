const jwt = require('jsonwebtoken');
const ownerModel = require('../models/owner-model.js');
const flash = require('connect-flash');

module.exports = async (req, res, next) => {
    if (!req.cookies.token) {
        req.flash("error", "You need to login first");
        return res.redirect('/owners/login');
    }

    try {
        let decoded = jwt.verify(req.cookies.token, process.env.EXPRESS_SESSION_SECRET);
        let owner = await ownerModel.findOne({ email: decoded.email }).select("-password");
        req.owner = owner;
        next();
    } catch (err) {
        req.flash('error', 'something went wrong.');
        res.redirect('/owners/login');
    }
};
