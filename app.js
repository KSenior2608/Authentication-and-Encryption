//config .env file
require('dotenv').config()
// acquriring packages
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
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
    required: 1
  },
  password: {
    type: String,
    required: 1
  }
});

//adding plugin to encrypt password
userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"]
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
    //creating new user
    let newUser = new User({
      email: req.body.username,
      password: req.body.password
    });
    //saving new user to db
    newUser.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
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
    User.findOne({
        email: username
      },
      function(err, foundUser) {
        if (err) {
          console.log(err);
        } else {
          if (foundUser) {
            if (foundUser.password === password) {
              res.render("secrets");
            } else {
              console.log("Please check your password.");
            }
          } else {
            console.log("No user exist for that email.");
          }
        }
      }
    )
  });
