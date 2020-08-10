//config .env file
require('dotenv').config()
// acquriring packages
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = parseInt(process.env.SALT_ROUNDS);
const app = express();

//using ejs templates
app.set("view engine", "ejs");

//using bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));

// using static files rendered automatically
app.use(express.static("public"));

//listening to port
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server is up and running");
});

//connecting to db
mongoose.connect("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//creating userSchema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: "Please enter your email"
  },
  password: {
    type: String,
    required: "Please enter your password"
  }
});

//creating model for usersDB
const User = mongoose.model("user", userSchema);

//handling home route
app.get("/", function(req, res) {
  res.render("home");
});

//handling register route
app.route("/register")

  //rendering register page
  .get(function(req, res) {
    res.render("register");
  })

  //registering new user
  .post(function(req, res) {
    //creating new user using bcrypt hashing
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      if (err) {
        console.log(err);
      } else {
        let newUser = new User({
          email: req.body.username,
          password: hash
        });
        //saving new user to db
        newUser.save(function(err) {
          if (err) {
            console.log(err);
          } else {
            res.render("secrets");
          }
        });
      }
    });
  });


//handling login route
app.route("/login")

  //rendering login page
  .get(function(req, res) {
    res.render("login");
  })

  //validating user
  .post(function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    //finding user
    User.findOne({
        email: username
      },
      function(err, foundUser) {
        //handling error
        if (err) {
          console.log(err);
        } else {
          if (foundUser) {
            //using bcrypt to change input into hash and compare
            bcrypt.compare(password, foundUser.password, function(err, result) {
              if (result === true) {
                res.render("secrets");
              } // handling wrong password
              else {
                console.log("Please check your password.");
              }
            });
          } else {
            console.log("No user exist for that email.");
          }
        }
      });
  });
