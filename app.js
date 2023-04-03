require('dotenv').config();
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

const app = express();

const maxAge = 360 * 1000;
const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: maxAge}
}));


mongoose.connect("mongodb://localhost:27017/blogDB");

const postSchema = mongoose.Schema({
  title: String,
  contents: Array,
});


const userSchema = mongoose.Schema({
    role: {
        type: String,
        enum : ['user','admin', 'editor']
    },
    email: String,
    username: String,
    passwordHash: String
});


const Post = mongoose.model('Post', postSchema);
const User = mongoose.model('User', userSchema);


app.get("/", function (req, res) {
    res.render("mainPage");
});


app.get("/tutorials", function(req, res){
    if (req.session.isAuth) {
        if (req.cookies.current_user) {
            const userParams = req.cookies.current_user;
            Post.find({}, function (err, posts) {
                if (err) {
                console.log(err);
                } else {
                    if (userParams.role === "admin") {
                        res.render("home", {
                            startingContent: homeStartingContent,
                            posts: posts,
                            role: "admin"
                        });
                    } else if(userParams.role === "editor" || userParams.role === "user") {
                        res.render("home", {
                            startingContent: homeStartingContent,
                            posts: posts,
                            role: "editor"
                        });
                    }
                    
                }
            }); 
        } else {
            req.session.isAuth = false;
            Post.find({}, function (err, posts) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("home", {
                        startingContent: homeStartingContent,
                        posts: posts,
                        role: ""
                    });
                }
            });
        }
    } else {
            Post.find({}, function (err, posts) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("home", {
                        startingContent: homeStartingContent,
                        posts: posts,
                        role: ""
                    });
                }
            });
    } 
});


app.get("/systemusers", function (req, res) {
    if (req.session.isAuth) {
        if (req.cookies.current_user) {
            const userParams = req.cookies.current_user;
            if (userParams.role === "admin") {
                const users = [];
                User.find({}, function (err, results) {
                    results.forEach(elem => {
                        users.push({email: elem.email, username: elem.username, role: elem.role});
                    });
                    res.render('systemusers', {users: users, role: userParams.role});
                })
            } else if(userParams.role === "editor" || userParams.role === "user") {
                res.render('error_page', 
                    {
                        errorCode: "403",
                        errorTitle: "Forbidden",
                        errorMsg: "Only admins can add or remove users"
                    }
                );
            } 
        } else {
            req.session.isAuth = false;
            res.redirect('/login');
        }
    } else {
            res.redirect('/login');
    } 

});


app.get("/registeruser", async function (req, res) {
    if (req.session.isAuth) {
        if (req.cookies.current_user) {
            const userParams = req.cookies.current_user;
            if (userParams.role === "admin") {
                res.render('registeruser', 
                    {
                        roleError: null,
                        usernameError: null,
                        emailError: null, 
                        passwordErrors: null,
                        current_params: null,
                        role: userParams.role
                    }
                );
            } else if(userParams.role === "editor" || userParams.role === "user") {
                res.render('error_page', 
                    {
                        errorCode: "403",
                        errorTitle: "Forbidden",
                        errorMsg: "Only admins can add or remove users"
                    }
                );
            } 
        } else {
            req.session.isAuth = false;
            res.redirect('/login');
        }
    } else {
            res.redirect('/login');
    }  
});


app.get("/compose", function(req, res){
    if (req.session.isAuth) {
        if (req.cookies.current_user) {
            const userParams = req.cookies.current_user;
            if (userParams.role === "admin" || userParams.role === "editor") {
                Post.find({}, function (err, posts) {
                    const records = posts
                    const fields = ['title']
                    const titles = records.map(i=>Object.fromEntries(fields.map(f=>[f, i[f]])));
                    res.render("compose", {titles: titles, error: null, role: userParams.role});
                }) 
            } else {
                res.render('error_page', 
                    {
                        errorCode: "403",
                        errorTitle: "Forbidden",
                        errorMsg: "Only admins and editors can access this page."
                    }
                );
            } 
        } else {
            req.session.isAuth = false;
            res.redirect('/login');
        }
    } else {
            res.redirect('/login');
    }   
});

app.get('/login', function (req, res) {
    if (!req.session.isAuth) {
        res.render('login', {emailError: null, passwordError: null, curr_email: null});
    } else {
        res.redirect("/tutorials")
    }
});


app.get('/dashboard', function (req, res) {
    res.render('edit');
})


app.get("/posts/:postTitle/:subtitle", function(req, res){
    const requestedPostTitle = req.params.postTitle;
    const subtitle = req.params.subtitle;
    let curr_post = null;
    let subtitleMatch = false;
    Post.find({}, function (err, posts) {
        if (err) {
        console.log(err);
        } else {
            posts.forEach(elem => {
                if(elem.title === requestedPostTitle) {
                        curr_post = elem;
                } 
            });
            if (curr_post) {
                curr_post.contents.forEach(element => {
                if (element.subtitleName === subtitle) {
                    subtitleMatch = true;
                }
            });
            }
            if (curr_post && subtitleMatch) {
                if (req.cookies.current_user) {
                    res.render("post", {
                        startingContent: homeStartingContent,
                        posts: posts,
                        requestedPost: curr_post,
                        renderSubtitle: subtitle,
                        role: req.cookies.current_user.role
                    });
                } else {
                    res.render("post", {
                        startingContent: homeStartingContent,
                        posts: posts,
                        requestedPost: curr_post,
                        renderSubtitle: subtitle,
                        role: ""
                    });
                }
                
            } else {
                res.render('error_page', {
                        errorCode: "404",
                        errorTitle: "Not Found",
                        errorMsg: "This page does not exist"
                    });
            }
            
        }
    });

});


app.get("/about", function(req, res){
    if (req.session.isAuth) {
        if (req.cookies.current_user) {
            const userParams = req.cookies.current_user;
            res.render("about", {aboutContent: aboutContent, role: userParams.role}); 
        } else {
            res.render("about", {aboutContent: aboutContent, role: ""});
        }
    } else {
            res.render("about", {aboutContent: aboutContent, role: ""});
    }   
});


app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent, role: ""});
});


app.get("/edit/:username", function (req, res) {
    const username = req.params.username;
    User.findOne({username: username}, function (err, user) {
        if (user) {
            res.render("editUserCredentials", {username: user.username, email: user.email, role: user.role});
        } else {
            res.render('error_page', {
                errorCode: "404",
                errorTitle: "Not Found",
                errorMsg: "This page does not exist"
            });
        }
    });
});


// Edit a post
app.get("/editpost/:title/:subtitle", function (req, res) {
    const title = req.params.title;
    const subtitle = req.params.subtitle;
    let curr_post = null;
    let current_content = "";
    let subtitleMatch = false;
    if (req.session.isAuth) {
        if (req.cookies.current_user) {
            const userParams = req.cookies.current_user;
            if (userParams.role === "admin" || userParams.role === "editor") {
                Post.find({}, function (err, posts) {
                    if (err) {
                        throw err;
                    } else {
                        posts.forEach(elem => {
                            if(elem.title === title) {
                                    curr_post = elem;
                            } 
                        });
                        if (curr_post) {
                            curr_post.contents.forEach(element => {
                                if (element.subtitleName === subtitle) {
                                    subtitleMatch = true;
                                    current_content = element.subtitleContent;
                                }
                            });
                        }
                        if (curr_post && subtitleMatch) {
                            res.render("editPostPage", {
                                title: title,
                                subtitle: subtitle,
                                content: current_content
                            });
                        } else {
                            res.render('error_page', {
                                    errorCode: "404",
                                    errorTitle: "Not Found",
                                    errorMsg: "This page does not exist"
                                });
                        }
                        
                    }
                });
            } else {
                res.redirect("/login")
            } 
        } else {
            req.session.isAuth = false;
            res.redirect('/login');
        }
    } else {
            res.redirect('/login');
    }   
});


app.post("/editpost/:title/:subtitle", function (req, res) {
    const title = req.body.inputTitle; 
    const subtitle = req.body.inputSubtitle; //
    const content = req.body.content; 
    const previous_title = req.params.title;
    const previous_subtitle = req.params.subtitle; 
    const previous_content = req.body.previous_content; 
    if (req.session.isAuth) {
        if (req.cookies.current_user) {
            const userParams = req.cookies.current_user;
            if (userParams.role === "admin" || userParams.role === "editor") {
                Post.findOne({title: previous_title}, function (err, result) {
                    if (err) throw err;
                    if (result) {
                        if (previous_title !== title) {
                            result.title = title;
                        } 
                        if (subtitle !== previous_subtitle && result.title === previous_title) {
                            result.contents.forEach(cnt => {
                                if (cnt.subtitleName === previous_subtitle) {
                                    cnt.subtitleName = subtitle;
                                }
                            });
                        }  
                        if (content !== previous_content) {
                            result.contents.forEach(cnt => {
                                if (previous_content === cnt.subtitleContent && cnt.subtitleName === previous_subtitle && result.title === previous_title) {
                                    cnt.subtitleContent = content;
                                }
                            });
                        } 
                        result.markModified('contents');
                        result.save();
                        res.redirect("/tutorials")
                    } else {
                        res.redirect("/logout")
                    }
                });
            } else {
                res.redirect("/login")
            } 
        } else {
            req.session.isAuth = false;
            res.redirect('/login');
        }
    } else {
            res.redirect('/login');
    }   
    
});


// Edit user credentials
app.post("/edit/:username", function (req, res) {
    const previous_username = req.body.previous_username;
    if (req.session.isAuth) {
        if (req.cookies.current_user) {
            const userParams = req.cookies.current_user;
            if (userParams.role === "admin") {
                User.findOne({username: previous_username}, function (err, user) {
                    if (user) {
                        user.username = req.body.username;
                        user.email = req.body.email;
                        user.role = req.body.role;
                        user.save();
                        res.status(200).send(JSON.stringify({"res": "ok"}))
                    } else {
                        res.status(404).send(JSON.stringify({"res": "This user does not exist."}));
                    }
                });
                
            } else if(userParams.role === "editor" || userParams.role === "user") {
                res.status(403).send(JSON.stringify({"res": "Only admins can edit user details"}));
            } 
        } else {
            req.session.isAuth = false;
            res.status(401).send(JSON.stringify({"res": "You are not authenticated"}));
        }
    } else {
            res.status(401).send(JSON.stringify({"res":"You are not authenticated"}));
    }  
});


app.get('/logout', function (req, res) {
    res.clearCookie("current_user");
    req.session.isAuth = false;
    res.redirect("/tutorials");
});



app.post("/compose", function(req, res){
    if (req.body.existence === 'new' && req.body.title ==="" || req.body.subtitle === "" || req.body.content === "") {
        Post.find({}, function (err, posts) {
            const records = posts
            const fields = ['title']
            const titles = records.map(i=>Object.fromEntries(fields.map(f=>[f, i[f]])));
            res.render("compose", {titles: titles, error: "Please do not leave the any field empty!"}); }); 
    } 
        
    else if (req.body.selectedTitle !==null && req.body.existence === "existing"){
        Post.findOne({title: req.body.selectTitle}, function (err, result) {
            if (err) throw err;
            if (result) {
                var subtitleExist = "";
                result.contents.forEach(content => {
                    if (content.subtitleName === req.body.subtitle) {
                        subtitleExist = "Yes";
                    }
                })
                if (subtitleExist) {
                    Post.find({}, function (err, posts) {
                        const records = posts
                        const fields = ['title']
                        const titles = records.map(i=>Object.fromEntries(fields.map(f=>[f, i[f]])));
                        res.render("compose", 
                            {
                                titles: titles, 
                                error: "This subtitle already exists. If you want to add something to this subtitle. Please edit it."
                            });
                    });
                } else {
                    result.contents = [...result.contents, {
                                subtitleName: req.body.subtitle,
                                subtitleContent: req.body.content
                            }]
                    result.save();
                    res.redirect("/tutorials"); 
                }
            } else {
                Post.find({}, function (err, posts) {
                    const records = posts
                    const fields = ['title']
                    const titles = records.map(i=>Object.fromEntries(fields.map(f=>[f, i[f]])));
                    res.render("compose", 
                        {
                            titles: titles, 
                            error: "This title does not exist. Please choose the 'new' option and continue."
                        });
                });
                
            }})
    } 
    
    else if(!req.body.existence) {
        Post.find({}, function (err, posts) {
            const records = posts
            const fields = ['title']
            const titles = records.map(i=>Object.fromEntries(fields.map(f=>[f, i[f]])));
            res.render("compose", {titles: titles, error: "If you are adding new title, clich 'new', otherwise 'existence'"});
        });
    } 
    
    else if (req.body.title && req.body.existence === "new") {
            Post.findOne({title: req.body.title}, function (err, result) {
                if (err) throw err;
                if (!result) {
                    const post = new Post({
                    title: req.body.title,
                    contents: [{
                                    subtitleName: req.body.subtitle,
                                    subtitleContent: req.body.content
                                }]
                    });
                    post.save(function (err) {
                        if (!err) {
                        res.redirect("/tutorials");
                        }
                    });
                } else {
                    Post.find({}, function (err, posts) {
                    const records = posts
                    const fields = ['title']
                    const titles = records.map(i=>Object.fromEntries(fields.map(f=>[f, i[f]])));
                    res.render("compose", {titles: titles, error: "This title already exists. Please choose the 'existing' option and continue"});
                });
                }
            });
            
    } 
    
    else {
        Post.find({}, function (err, posts) {
            const records = posts
            const fields = ['title']
            const titles = records.map(i=>Object.fromEntries(fields.map(f=>[f, i[f]])));
            res.render("compose", {titles: titles, error: "Do not troll me!"});
        });
    }
    
    
});



// app.post('/register', 
//     body('name').not().isEmpty().trim().withMessage('Name field cannot be empty'),
//     body('surname').not().isEmpty().trim().withMessage('Surname field cannot be empty'),
//     body('location').not().isEmpty().trim().withMessage('Location field cannot be empty'),
//     body('email').isEmail().withMessage('This is not a valid email format').normalizeEmail(),
//     body('pass').isLength({min: 5}).withMessage('Password length should be longer')
//         .matches('[A-Z]').withMessage('Password should contain uppercase letters')
//         .matches('[0-9]').withMessage('Password should contain a number')
//     , async function (req, res) {
//         const errors = validationResult(req);
//         const {name, surname, location, email, pass, confirm_pass} = req.body;
//         const current_params = [name, surname, location, email];
//         if (errors.isEmpty()) {
//             let nameError = null;
//             let surnameError = null;
//             let locationError = null;
//             let emailError = null;
//             let passwordErrors = [];
//             User.findOne({email: email}, async function (err, result) {
//                 if (result) {
//                     emailError = "This user has already registered";
//                     res.render('register', 
//                         {
//                             nameError: null, 
//                             surnameError: null, 
//                             locationError: null, 
//                             emailError: emailError, 
//                             passwordErrors: null,
//                             confirm_pass_error: null,
//                             current_params: current_params
//                         }
//                     );
//                 } else if (pass !== confirm_pass){
//                     res.render('register', 
//                         {
//                             nameError: null, 
//                             surnameError: null, 
//                             locationError: null, 
//                             emailError: null, 
//                             passwordErrors: null,
//                             confirm_pass_error: "Confirmation password does not match",
//                             current_params: current_params
//                         }
//                     );
//                 } else {
//                     const passwordHash = await bcrypt.hash(pass, 12);
//                     const newUser = new User({
//                         name: name,
//                         surname: surname, 
//                         location: location,
//                         email: email,
//                         password: passwordHash,
//                         isSeller: false
//                     });
//                     await newUser.save();
//                     res.redirect("/login")
//                 }
//             })
//         } else {
//             let nameError = null;
//             let surnameError = null;
//             let locationError = null;
//             let emailError = null;
//             let passwordErrors = [];
//             const errorArray = errors.array();
//             console.log(errorArray);
//             errorArray.forEach(elem => {
//                 if (elem.param === 'name') {
//                     nameError = elem.msg;
//                 }
//                 if (elem.param === 'surname') {
//                     surnameError = elem.msg;
//                 }
//                 if (elem.param === 'location') {
//                     locationError = elem.msg;
//                 }
//                 if (elem.param === 'email') {
//                     emailError = elem.msg;
//                 }
//                 if (elem.param === 'pass') {
//                     if (passwordErrors.length < 3) {
//                         passwordErrors.push(elem.msg);
//                     }
//                 }
//             });
//             res.render('register', 
//                 {
//                     nameError: nameError, 
//                     surnameError: surnameError, 
//                     locationError: locationError, 
//                     emailError: emailError, 
//                     passwordErrors: passwordErrors,
//                     confirm_pass_error: null,
//                     current_params: current_params
//                 }
//             );
//         }
// });




app.post('/login', 
    body('email').trim().not().isEmpty().withMessage('Please, fill the email field'),
    body('password').trim().not().isEmpty().withMessage('Please, fill the password field')
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
                if (elem.param === 'password') {
                    passwordError = elem.msg;
                }
            });
            res.render('login', {emailError: emailError, passwordError: passwordError, curr_email: email});           
        } else{ 
            const {email, password} = req.body;
            let passwordError = null;
            let emailError = null;
            User.findOne({email: email}, async function (err, result) {
                if (err) throw err;
                if (!result) {
                    emailError = 'This user does not exist!';
                    res.render('login', {emailError: emailError, passwordError: passwordError, curr_email: email});
                } else {
                    await bcrypt.compare(password, result.passwordHash, function (err, matches) {
                        if(matches) {
                            res.cookie('current_user', {username: result.username, role: result.role}, {maxAge: maxAge, secure: true, httpOnly: true});
                            req.session.isAuth = true;
                            res.redirect('/');
                        } else {
                            passwordError = "Password incorrect";
                            res.render('login', {emailError: emailError, passwordError: passwordError, curr_email: email})
                        }
                    })
                }
            })
        }
});


app.post("/deleteuser", function (req, res) {
    if (req.session.isAuth) {
        if (req.cookies.current_user) {
            const userParams = req.cookies.current_user;
            if (userParams.role === "admin") {
                User.deleteOne({email: req.body.userEmail}, function (err) {
                    if (err) {
                        res.status(404).send("This user does not exist");
                    } else {
                        res.status(200).send("Successfully deleted");
                    }
                });
                
            } else if(userParams.role === "editor" || userParams.role === "user") {
                res.status(403).send("Only admins can add or remove users");
            } 
        } else {
            req.session.isAuth = false;
            res.status(401).send("You are not authenticated");
        }
    } else {
            res.status(401).send("You are not authenticated");
    }  
});


app.post("/registeruser", async function (req, res) {
    const role = req.body.userRole;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const passwordHash = await bcrypt.hash(password, 12);

    if (req.session.isAuth) {
        if (req.cookies.current_user) {
            const userParams = req.cookies.current_user;
            if (userParams.role === "admin") {
                User.findOne({email: email}, function (err, response) {
                    if (err) throw err;
                    if (!response) {
                        const user = new User({
                            role: role,
                            email: email,
                            username: username,
                            passwordHash: passwordHash
                        });
                        user.save();
                        res.redirect("https://mydata.az/systemusers");
                    } else {
                        res.render('registeruser', 
                        {
                            roleError: null,
                            usernameError: null,
                            emailError: "This email already exists", 
                            passwordErrors: null,
                            current_params: null
                        }
                        );
                    }
                });
                
            } else if(userParams.role === "editor" || userParams.role === "user") {
                res.render('error_page', 
                    {
                        errorCode: "403",
                        errorTitle: "Forbidden",
                        errorMsg: "Only admins can add or remove users"
                    }
                );
            } 
        } else {
            req.session.isAuth = false;
            res.redirect('/login');
        }
    } else {
            res.redirect('/login');
    }  

});


app.get('*', function(req, res){
  res.render('error_page', {
                        errorCode: "404",
                        errorTitle: "Not Found",
                        errorMsg: "This page does not exist"
                    });
});


const port = 3333;
app.listen(port, () => {});
