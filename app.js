const express = require('express')
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const flash = require('connect-flash');

require("dotenv").config();

const ownersRouter = require('./routes/ownersRouter.js')
const usersRouter = require('./routes/usersRouter')
const productsRouter = require('./routes/productsRouter')
const index = require('./routes/index.js')

const db = require('./config/mongoose-connection.js')

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(
    expressSession({
        resave:false,
        saveUninitialized:false,
        secret:process.env.EXPRESS_SESSION_SECRET,
    })
)
app.use(flash());
app.use(express.static(path.join(__dirname,"public")));// make user info available to all views
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.loggedin = !!req.user;
    next();
});app.set("view engine",'ejs')

app.use('/owners',ownersRouter);
app.use('/users',usersRouter);
app.use('/products',productsRouter);
app.use('/',index);


app.listen(3000,()=>{
    console.log("http://localhost:3000");
    
})