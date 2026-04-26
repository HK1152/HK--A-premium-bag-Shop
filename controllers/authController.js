const userModel = require("../models/user-model.js")
const bcrypt = require('bcrypt')
const { generateToken } = require('../utils/generateToken.js');

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