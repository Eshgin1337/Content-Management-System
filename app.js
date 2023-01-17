//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require("multer");
const path = require("path");
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const fs = require('fs');

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/blogDB");

const postSchema = mongoose.Schema({
  title: String,
  subtitle: String,
  content: String
});


const Post = mongoose.model('Post', postSchema);


app.get("/", function(req, res){
  Post.find({}, function (err, posts) {
    if (err) {
      console.log(err);
    } else {
      res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
    }
  });
});

  
app.get("/compose", function(req, res){
  res.render("compose");
});

app.get('/login', function (req, res) {
    res.render('login', {emailError: null, passwordError: null, curr_email: null});
})

app.get('/register', function (req, res) {
    res.render('register', 
        {
            nameError: null, 
            surnameError: null, 
            locationError: null, 
            emailError: null, 
            passwordErrors: null,
            confirm_pass_error: null,
            current_params: null
        }
    );
});

app.get("/posts/:postID", function(req, res){
    const requestedPostID = req.params.postID;
    let curr_post = {}
    Post.find({}, function (err, posts) {
        if (err) {
        console.log(err);
        } else {
            posts.forEach(elem => {
                if(elem.id === requestedPostID) {
                        curr_post = elem;
                } 
            });
            res.render("post", {
                        startingContent: homeStartingContent,
                        posts: posts,
                        requestedPost: curr_post
                    })
            
        }
    });

});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.title,
    subtitle: req.body.subtitle,
    content: req.body.content
  });
  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.post('/register', 
    body('name').not().isEmpty().trim().withMessage('Name field cannot be empty'),
    body('surname').not().isEmpty().trim().withMessage('Surname field cannot be empty'),
    body('location').not().isEmpty().trim().withMessage('Location field cannot be empty'),
    body('email').isEmail().withMessage('This is not a valid email format').normalizeEmail(),
    body('pass').isLength({min: 5}).withMessage('Password length should be longer')
        .matches('[A-Z]').withMessage('Password should contain uppercase letters')
        .matches('[0-9]').withMessage('Password should contain a number')
    , async function (req, res) {
        const errors = validationResult(req);
        const {name, surname, location, email, pass, confirm_pass} = req.body;
        const current_params = [name, surname, location, email];
        if (errors.isEmpty()) {
            let nameError = null;
            let surnameError = null;
            let locationError = null;
            let emailError = null;
            let passwordErrors = [];
            User.findOne({email: email}, async function (err, result) {
                if (result) {
                    emailError = "This user has already registered";
                    res.render('register', 
                        {
                            nameError: null, 
                            surnameError: null, 
                            locationError: null, 
                            emailError: emailError, 
                            passwordErrors: null,
                            confirm_pass_error: null,
                            current_params: current_params
                        }
                    );
                } else if (pass !== confirm_pass){
                    res.render('register', 
                        {
                            nameError: null, 
                            surnameError: null, 
                            locationError: null, 
                            emailError: null, 
                            passwordErrors: null,
                            confirm_pass_error: "Confirmation password does not match",
                            current_params: current_params
                        }
                    );
                } else {
                    const passwordHash = await bcrypt.hash(pass, 12);
                    const newUser = new User({
                        name: name,
                        surname: surname, 
                        location: location,
                        email: email,
                        password: passwordHash,
                        isSeller: false
                    });
                    await newUser.save();
                    res.redirect("/login")
                }
            })
        } else {
            let nameError = null;
            let surnameError = null;
            let locationError = null;
            let emailError = null;
            let passwordErrors = [];
            const errorArray = errors.array();
            console.log(errorArray);
            errorArray.forEach(elem => {
                if (elem.param === 'name') {
                    nameError = elem.msg;
                }
                if (elem.param === 'surname') {
                    surnameError = elem.msg;
                }
                if (elem.param === 'location') {
                    locationError = elem.msg;
                }
                if (elem.param === 'email') {
                    emailError = elem.msg;
                }
                if (elem.param === 'pass') {
                    if (passwordErrors.length < 3) {
                        passwordErrors.push(elem.msg);
                    }
                }
            });
            res.render('register', 
                {
                    nameError: nameError, 
                    surnameError: surnameError, 
                    locationError: locationError, 
                    emailError: emailError, 
                    passwordErrors: passwordErrors,
                    confirm_pass_error: null,
                    current_params: current_params
                }
            );
        }
});


app.post('/login', 
    body('email').trim().not().isEmpty().withMessage('Please, fill username'),
    body('pass').not().isEmpty().withMessage('Please, fill password')
    , function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const loginErrors = errors.array();
            let emailError = null;
            let email = req.body.email;
            let passwordError = null;
            loginErrors.forEach(elem => {
                if (elem.param === 'email') {
                    emailError = elem.msg;
                }
                if (elem.param === 'pass') {
                    passwordError = elem.msg;
                }
            });
            res.render('login', {emailError: emailError, passwordError: passwordError, curr_email: email});           
        } else{ 
            const {email, pass} = req.body;
            let passwordError = null;
            let emailError = null;
            User.findOne({email: email}, async function (err, result) {
                if (err) throw err;
                if (!result) {
                    emailError = 'This user does not exist!';
                    console.log(email);
                    res.render('login', {emailError: emailError, passwordError: passwordError, curr_email: email});
                } else {
                    await bcrypt.compare(pass, result.password, function (err, matches) {
                        if(matches) {
                            res.cookie('current_user', 
                                {
                                    name: result.name, 
                                    surname: result.surname,
                                    location: result.location,
                                    email: result.email
                                }, 
                                    {maxAge: 180000}
                            );
                            req.session.isAuth = true;
                            res.redirect('/shop');
                        } else {
                            passwordError = "Password incorrect";
                            res.render('login', {emailError: emailError, passwordError: passwordError, curr_email: email})
                        }
                    })
                }
            })
        }
})

app.get('/logout', function (req, res) {
    res.clearCookie("current_user");
    req.session.isAuth = false;
    res.redirect("/shop")
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
