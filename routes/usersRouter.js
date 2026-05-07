const express = require('express')
const router = express.Router();
const {registerUser, loginUser, logout, forgotPassword, resetPassword} = require('../controllers/authController.js')

router.get('/', (req, res) => {
    res.send('user');
})

router.get('/register', (req, res) => {
    let error = req.flash('error');
    res.render("index", { error, loggedin: !!req.user, user: req.user, showLogin: false });
})

router.get('/login', (req, res) => {
    let error = req.flash('error');
    res.render("index", { error, loggedin: !!req.user, user: req.user, showLogin: true });
})

router.get('/forgot-password', (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    res.render('forgot-password', { error, success, loggedin: false });
});

router.post('/forgot-password', forgotPassword);

router.get('/reset-password/:token', async (req, res) => {
    let error = req.flash('error');
    res.render('reset-password', { error, token: req.params.token, loggedin: false });
});

router.post('/reset-password/:token', resetPassword);

router.post('/register', registerUser)

router.post('/login', loginUser)

router.get('/logout', logout)
const isloggedin = require('../middlewares/isLoggedin.js');
const userModel = require('../models/user-model.js');
const upload = require('../config/multer-config.js');

router.get('/manage', isloggedin, async (req, res) => {
    let success = req.flash('success');
    let error = req.flash('error');
    let user = await userModel.findById(req.user._id);
    res.render('user-manage', { success, error, user, loggedin: true });
});

router.post('/manage', isloggedin, upload.single('picture'), async (req, res) => {
    try {
        let { fullname, address } = req.body;
        let user = await userModel.findById(req.user._id);
        
        if (fullname) user.fullname = fullname;
        if (address) user.address = address;
        if (req.file) {
            user.picture = req.file.buffer;
        }

        await user.save();
        req.flash('success', 'Profile updated successfully');
        res.redirect('/users/manage');
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/users/manage');
    }
});

module.exports = router;