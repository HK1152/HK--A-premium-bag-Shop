const userModel = require("../models/user-model.js")
const bcrypt = require('bcrypt')
const { generateToken } = require('../utils/generateToken.js');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

module.exports.registerUser = async (req, res) => {
    try {
        let { email, password, fullname } = req.body;

        if (!fullname || fullname.length < 3) {
            req.flash("error", "Full name must be at least 3 characters long.");
            return res.redirect("/");
        }

        let user = await userModel.findOne({ email: email });
        if (user) {
            req.flash("error", 'You already have an account')
            return res.redirect('/')
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        let createdUser = await userModel.create({
            email,
            password: hash,
            fullname
        })
        
        let token = generateToken(createdUser);
        res.cookie('token', token)
        res.redirect('/shop')
    }
    catch (err) {
        req.flash("error", err.message);
        res.redirect("/");
    }
}

module.exports.loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;
        let user = await userModel.findOne({ email: email });

        if (!user) {
            req.flash("error",'Email or password  incorrect');
            return res.redirect('/')
        };
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                let token = generateToken(user);
                res.cookie('token', token)
                res.redirect('/shop')
            } else {
                req.flash("error","Email or password  incorrect");
                return res.redirect('/')
            }
        })

    }
    catch (err) {
        res.send(err.message);

    }
}

module.exports.logout = (req,res)=>{
    res.cookie("token",'')
    res.redirect('/')
};

module.exports.forgotPassword = async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            req.flash("error", "User not found with this email.");
            return res.redirect("/users/forgot-password");
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/users/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                message,
            });
            req.flash("success", "Password reset link sent to your email.");
            res.redirect("/users/forgot-password");
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            req.flash("error", "Email could not be sent. Please try again later.");
            res.redirect("/users/forgot-password");
        }
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/users/forgot-password");
    }
};

module.exports.resetPassword = async (req, res) => {
    try {
        const user = await userModel.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            req.flash("error", "Password reset token is invalid or has expired.");
            return res.redirect("/users/forgot-password");
        }

        if (req.body.password !== req.body.confirmPassword) {
            req.flash("error", "Passwords do not match.");
            return res.redirect(`/users/reset-password/${req.params.token}`);
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        req.flash("success", "Password has been reset successfully. You can now login.");
        res.redirect("/");
    } catch (err) {
        req.flash("error", err.message);
        res.redirect(`/users/reset-password/${req.params.token}`);
    }
};