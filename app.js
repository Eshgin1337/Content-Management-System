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


// Multer code to store pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname); // Set the filename to make it unique
  }
});

const upload = multer({ storage: storage });


// Set up connection to database
mongoose.connect("mongodb://localhost:27017/blogDB");


// Create Schemas
const courseSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  contents: [
    {heading: {
        headingName: {
            type: String,
            required: true
        },
        headingContents: [{
            subtitle: {
                type: String,
                required: true
            },
            content: {
                type: String,
                required: true
            }
        }]
    }
}],
  profilePicture: {
    type: String
  }
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


const Course = mongoose.model('Course', courseSchema);
const User = mongoose.model('User', userSchema);


// app.get("/", function (req, res) {
//     res.render("mainPage");
// });


app.get("/", function(req, res){
    if (req.session.isAuth) {
        if (req.cookies.current_user) {
            const userParams = req.cookies.current_user;
            Course.find({}, function (err, posts) {
                if (err) {
                    console.log(err);
                } else {
                    // Filter posts with non-empty contents
                    const filteredPosts = posts.filter(post => post.contents.length > 0);
                    if (err) {
                        console.log(err);
                    } else {
                        if (userParams.role === "admin") {
                        res.render("courses", {
                            startingContent: homeStartingContent,
                            posts: filteredPosts,
                            role: "admin"
                        });
                        } else if (userParams.role === "editor" || userParams.role === "user") {
                        res.render("courses", {
                            startingContent: homeStartingContent,
                            posts: filteredPosts,
                            role: "editor"
                        });
                        }
                    }
                }
                });

        } else {
            Course.find({}, function (err, posts) {
                if (err) {
                    console.log(err);
                } else {
                    // Filter posts with non-empty contents
                    const filteredPosts = posts.filter(post => post.contents.length > 0);
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("courses", {
                            startingContent: homeStartingContent,
                            posts: filteredPosts,
                            role: ""
                        });
                    }
                }
            });

        }
    } else {
            Course.find({}, function (err, posts) {
                if (err) {
                    console.log(err);
                } else {
                    // Filter posts with non-empty contents
                    const filteredPosts = posts.filter(post => post.contents.length > 0);
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("courses", {
                            startingContent: homeStartingContent,
                            posts: filteredPosts,
                            role: ""
                        });
                    }
                }
            });
    } 
});


app.get("/createCourse", function (req, res) {
    res.render("createCourse");
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


app.get("/compose/:course", function(req, res) {
  const courseName = req.params.course;
  Course.findOne({ title: courseName }, function(err, course) {
    if (err) {
      // Handle the error
      console.error(err);
      return;
    }

    if (!course) {
      // No course found
      res.render("error_page", {
        errorCode: "404",
        errorTitle: "Not found",
        errorMsg: "There is no course like this still"
      });
    } else if (course.contents.length === 0) {
      // No headings exist
      res.render("compose", { headings: null, error: null, course: courseName });
    } else {
      const headings = course.contents.map((content) => content.heading.headingName);
      res.render("compose", { headings: headings, error: null, course: courseName });
    }
  });
});


// if (req.session.isAuth) {
    //     if (req.cookies.current_user) {
    //         const userParams = req.cookies.current_user;
    //         if (userParams.role === "admin" || userParams.role === "editor") {
//         } else {
                // res.render('error_page', 
                //     {
                //         errorCode: "403",
                //         errorTitle: "Forbidden",
                //         errorMsg: "Only admins and editors can access this page."
                //     }
                // );
    //         } 
    //     } else {
    //         req.session.isAuth = false;
    //         res.redirect('/login');
    //     }
    // } else {
    //         res.redirect('/login');
    // }   

app.get('/login', function (req, res) {
    if (!req.session.isAuth) {
        res.render('login', {emailError: null, passwordError: null, curr_email: null});
    } else {
        res.redirect("/courses")
    }
});


app.get('/dashboard', function (req, res) {
    res.render('edit');
})


app.get("/courses/:courseTitle/:headingName/:headingSubtitle", function(req, res) {
  const requestedCourseTitle = req.params.courseTitle;
  const headingName = req.params.headingName;
  const headingSubtitle = req.params.headingSubtitle || null;
  Course.findOne({ title: requestedCourseTitle }, function(err, curr_post) {
    if (err) {
      console.log(err);
    } else {
      if (curr_post) {
        let matchingHeading = null;
        let matchingHeadingSubtitle = null;
        curr_post.contents.forEach(element => {
          if (element.heading.headingName === headingName) {
            matchingHeading = "exists";
            element.heading.headingContents.forEach(headingContent => {
                if (headingContent.subtitle === headingSubtitle) {
                    matchingHeadingSubtitle = "exists";
                }
            })
          }
        });

        if (matchingHeading && matchingHeadingSubtitle) {
          if (req.cookies.current_user) {
            res.render("post", {
              startingContent: homeStartingContent,
              posts: curr_post, // Render only the matching course post
              requestedCourseTitle: requestedCourseTitle,
              headingName: headingName,
              headingSubtitle: headingSubtitle,
              role: req.cookies.current_user.role
            });
          } else {
            res.render("post", {
              startingContent: homeStartingContent,
              posts: curr_post, // Render only the matching course post
              requestedCourseTitle: requestedCourseTitle,
              headingName: headingName,
              headingSubtitle: headingSubtitle,
              role: ""
            });
          }
        } else {
          res.render("error_page", {
            errorCode: "404",
            errorTitle: "Not Found",
            errorMsg: "This page does not exist"
          });
        }
      } else {
        res.render("error_page", {
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
                Course.find({}, function (err, posts) {
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
                                if (element.titleName === subtitle) {
                                    subtitleMatch = true;
                                    current_content = element.subtitleContent;
                                }
                            });
                        }
                        if (curr_post && subtitleMatch) {
                            res.render("editCoursePage", {
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


// Delete page
app.get("/delete", function(req, res) {
  // Retrieve the courses data from the database
  Course.find({}, function(err, courses) {
    if (err) {
      // Handle the error
      console.error(err);
      return;
    }

    // Transform the courses data into the desired format
    const formattedCourses = courses.map(course => {
      const formattedHeadings = course.contents.map(content => {
        const formattedSubtitles = content.heading.headingContents.map(subtitle => {
          return { subtitleName: subtitle.subtitle };
        });
        return { headingName: content.heading.headingName, subtitles: formattedSubtitles };
      });
      return { courseName: course.title, headings: formattedHeadings };
    });

    // Render the deletePage.ejs file and pass the formattedCourses parameter
    res.render("deletePage", { courses: formattedCourses });
  });
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
                Course.findOne({title: previous_title}, function (err, result) {
                    if (err) throw err;
                    if (result) {
                        if (previous_title !== title) {
                            result.title = title;
                        } 
                        if (subtitle !== previous_subtitle && result.title === previous_title) {
                            result.contents.forEach(cnt => {
                                if (cnt.titleName === previous_subtitle) {
                                    cnt.titleName = subtitle;
                                }
                            });
                        }  
                        if (content !== previous_content) {
                            result.contents.forEach(cnt => {
                                if (previous_content === cnt.subtitleContent && cnt.titleName === previous_subtitle && result.title === previous_title) {
                                    cnt.subtitleContent = content;
                                }
                            });
                        } 
                        result.markModified('contents');
                        result.save();
                        res.redirect("/courses")
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
    res.redirect("/courses");
});



app.post("/compose", function(req, res){
    const existenceStatus = req.body.existence || "new";
    var currHeading = "";
    if (!req.body.heading && !req.body.selectHeading) {
        currHeading = "";
    } else if (!req.body.heading) {
        currHeading = req.body.selectHeading;
    } else {
        currHeading = req.body.heading
    }
    const currContent = req.body.content;
    const courseName = req.body.course;
    const subtitle = req.body.subtitle;
    console.log(existenceStatus, currHeading, currContent, courseName, subtitle);
    if ((currHeading==="" || subtitle === "" || currContent === "")) {
        Course.findOne({title: courseName}, function (err, course) {
            const records = course;
            const fields = ['title']
            if (records.contents.length === 0) {
                res.render("compose", {headings: null, error: "Please do not leave the any field empty!", course: courseName}); 
            } else {
                const headings = course.contents.map(content => content.heading);
                res.render("compose", {headings: headings, error: "Please do not leave the any field empty!", course: courseName});
            }
        }); 
    } 

    else {
        Course.findOne({ title: courseName }, function(err, course) {
            if (err) {
                // Handle the error
                console.error(err);
                return;
            }

            if (!course) {
                // No course found
                res.render("error_page", {
                errorCode: "404",
                errorTitle: "Not found",
                errorMsg: "This course does not exist."
                });
                return;
            }

            const existingHeading = course.contents.find(
                (content) => content.heading.headingName === currHeading
            );

            if (existingHeading) {
                const existingSubtitle = existingHeading.heading.headingContents.find(
                    (currSubtitle) => currSubtitle.subtitle === subtitle
                );

            if (existingSubtitle) {
                // Subtitle already exists
                res.render("compose", {
                    headings: null,
                    error: "This subtitle already exists!",
                    course: courseName
                });
                return;
            }

            // Subtitle doesn't exist, extend headingContents array
            existingHeading.heading.headingContents.push({
                subtitle: subtitle,
                content: currContent
            });
        } else {
            // Heading doesn't exist, extend contents array
            course.contents.push({
            heading: {
                headingName: currHeading,
                headingContents: [
                {
                    subtitle: subtitle,
                    content: currContent
                }
                ]
            }
            });
        }

        // Save the updated course document
        course.save(function(err) {
            if (err) {
            // Handle the error
            console.error(err);
            return;
            }

            // Redirect or render success page
            res.redirect("/compose/Python");
        });
        });

    }
});


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
                        res.redirect("http://localhost:3000/systemusers");
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


app.post('/createCourse', upload.single('profilePicture'), (req, res) => {
  // Access the uploaded file using req.file
  if (req.file) {
    // Handle the file, e.g., store it in the appropriate location or perform further processing
  }

  // Access other form fields using req.body
  const { title } = req.body;

  // Create a new course object and save it to the database
  const newCourse = new Course({ title, profilePicture: req.file.filename });
  newCourse.save()
    .then(savedCourse => {
      res.redirect('/');
    })
    .catch(error => {
      console.error('Failed to create the course:', error);
      res.status(500).json({ error: 'Failed to create the course' });
    });
});

app.get('*', function(req, res){
  res.render('error_page', {
                        errorCode: "404",
                        errorTitle: "Not Found",
                        errorMsg: "This page does not exist"
                    });
});


const port = 3000;
app.listen(port, () => {});
