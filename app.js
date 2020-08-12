//config .env file
require('dotenv').config()
// acquriring packages
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const app = express();

//templating
app.set("view engine", "ejs");

//parsing form data
app.use(bodyParser.urlencoded({
  extended: true
}));

// using static files rendered automatically
app.use(express.static("public"));

//config session
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false
  }
}));

//init passport authentication
app.use(passport.initialize());

//persistent sessions
app.use(passport.session());

//listen to port
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server is up and running");
});

//deprecation warning
mongoose.set('useCreateIndex', true);

//connect to db
mongoose.connect("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//create userSchema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
  }
});

//set user schema to use passport local
userSchema.plugin(passportLocalMongoose);

//creating model for usersDB
const User = mongoose.model("user", userSchema);

//set passport use generated strategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//handle home route
app.get("/", function(req, res) {
  res.render("home");
});

//secrets route
app.route("/secrets")

  //render secret page
  .get(function(req, res) {

    //check for request authentication
    if (req.isAuthenticated()) {
      res.render("secrets");
    } else {
      //redirect on authentication failure
      res.redirect("/login");
    }
  });

//handle register route
app.route("/register")

  //render register page
  .get(function(req, res) {
    res.render("register");
  })

  //registering new user
  .post(function(req, res) {
    //register user
    User.register({
        username: req.body.username,
      },
      req.body.password,
      //handle callback
      function(err, newUser) {
        if (err) {
          //log error
          console.log(err);
          res.redirect("/");
        } else {
          //if works fine authenticating user
          passport.authenticate("local")(req, res, function() {
            //redirect to secrets route
            res.redirect("/secrets");
          });
        }
      });
  });


//handle login route
app.route("/login")

  //render login page
  .get(function(req, res) {
    res.render("login");
  })

  //validate user
  .post(function(req, res) {
    //get user details
    let user = new User({
      username: req.body.username,
      password: req.body.password
    });
    //authenticate user
    req.login(user, function(err) {
      //handle err
      if (err) {
        console.log(err);
        res.redirect("/login");
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/secrets");
        });
      }
    });
  });

//handle logout route
app.route("/logout")

  //logout user
  .get(function(req, res) {
    req.logout();
    //redirect to home route
    res.redirect("/");
  })
