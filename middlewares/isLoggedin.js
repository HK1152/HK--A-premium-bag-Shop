const jwt = require('jsonwebtoken');
const userModel = require('../models/user-model.js');
const flash = require('connect-flash');

module.exports = async (req, res, next)=>{
    if (!req.cookies.token) {
        req.flash("error", "You need to login first");
        return res.redirect('/');
    }

    try {
        let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
        let user = await userModel
            .findOne({ email: decoded.email })
            .select("-password"); // is se password select nahi hoga
        req.user = user;
        next();
    } catch (err) {
        req.flash('error', 'something went wrong.');
        res.redirect('/')
    }
};