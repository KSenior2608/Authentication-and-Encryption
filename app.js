// acquriring packages
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
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
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//creating model for usersDB
const User = mongoose.model("user", {
  email: {
    type: String,
    required: 1
  },
  password: {
    type: String,
    required: 1
  }
});

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
  })
