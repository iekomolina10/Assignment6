/*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
*  Name: Ieko Molina Student ID 112614227 Date: 08/07/2023
*
*  Online (Cyclic) Link: ________________________________________________________
*
********************************************************************************/ 


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var cData = require("./modules/collegeData");
var router = express.Router();
const exphbs = require("express-handlebars");

// Setup handlebars and helpers
app.engine(".hbs", exphbs.engine(
    { 
        extname: ".hbs",
        helpers: {
            navLink: function(url, options){
                return '<li' + 
                    ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                    '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
            },
            equal: function (lvalue, rvalue, options) {
                if (arguments.length < 3)
                    throw new Error("Handlebars Helper equal needs 2 parameters");
                if (lvalue != rvalue) {
                    return options.inverse(this);
                } else {
                    return options.fn(this);
                }
            }
        }
        
    }));
app.set("view engine", ".hbs");

// Create app.use for the views
app.use(express.static('./views'));

//Create app.use for the public
app.use(express.static('./public'));
app.use('/css', express.static(__dirname + 'public/css'))

//Json Middleware
app.use(express.json());

//Adding body-parser
app.use(express.urlencoded({extended:true}))

//Middleware function to fix "Active" item in menu bar
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
    next();
});

app.get("/students", (req, res) => {``
    if (Object.keys(req.query).length > 0) {
        var param1Value = req.query.course; // Get the Parameters
        console.log(param1Value)
        cData.getStudentsByCourse(param1Value)
        .then((filteredStudents) => {
            //res.send(filteredStudents);
            res.render("students", {students: filteredStudents});
        })
        .catch((error) => {
            res.render("students", {message: "no results"});
        });
    } 
    else {
        cData.getAllStudents()
        .then((students) => {
            res.render("students", {students: students});
        })
        .catch((error) => {
            res.render("students", {message: "no results"});
        });
    }
});

app.get("/courses", (req, res) => {
    cData.getCourses()
    .then((courses) => {
        //res.send(courses);
        res.render("courses", {courses: courses});
    })
    .catch((error) => {
        res.render("courses", {message: "no results"});
    });
});

/*
app.get('/student/:id', (req, res) => {
  const studentId = req.params.id;
  cData.getStudentByNum(studentId)
  .then((foundStudent) => {
      //res.send(foundStudent);
      res.render("student", { student: foundStudent }); 
  })
  .catch((error) => {
      console.log({message:"no results"});
  });
});
*/

app.get("/student/:studentNum", (req, res) => {

    // initialize an empty object to store the values
    let viewData = {};

    cData.getStudentByNum(req.params.studentNum).then((data) => {
        if (data) {
            viewData.student = data; //store student data in the "viewData" object as "student"
        } else {
            viewData.student = null; // set student to null if none were returned
        }
    }).catch(() => {
        viewData.student = null; // set student to null if there was an error 
    }).then(cData.getCourses)
    .then((data) => {
        viewData.courses = data; // store course data in the "viewData" object as "courses"

        // loop through viewData.courses and once we have found the courseId that matches
        // the student's "course" value, add a "selected" property to the matching 
        // viewData.courses object

        for (let i = 0; i < viewData.courses.length; i++) {
            if (viewData.courses[i].courseId == viewData.student.course) {
                viewData.courses[i].selected = true;
            }
        }

    }).catch(() => {
        viewData.courses = []; // set courses to empty if there was an error
    }).then(() => {
        if (viewData.student == null) { // if no student - return an error
            res.status(404).send("Student Not Found");
        } else {
            res.render("student", { viewData: viewData }); // render the "student" view
        }
    });
});

// Get Course by ID
app.get('/course/:id', (req, res) => {
    const courseId = req.params.id;
    cData.getCourseById(courseId)
    .then((foundCourse) => {
        //res.send(foundCourse);
        res.render("course", { course: foundCourse }); 
    })
    .catch((error) => {
        res.status(404).send("Course Not Found");
    });
  });

//Delete by Course ID
app.get('/course/delete/:id', (req, res) => {
    const courseId = req.params.id;
    cData.deleteCourseById(courseId)
    .then(() => {
        res.redirect('/courses') 
    })
    .catch((error) => {
        res.status(505).send("Unable to Remove Course/Course Not Found");
    });
});

//Delete Student by Num
app.get('/students/delete/:studentNum', (req, res) => {
    const studentNum = req.params.studentNum;
    cData.deleteStudentByNum(studentNum)
        .then(() => {
            res.redirect('/students');
        })
        .catch(error => {
            res.status(500).send("Unable to Remove Student / Student not found");
        });
});

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/htmlDemo', (req, res) => {
    res.render('htmlDemo');
});

app.get('/students/add', (req, res) => {
    cData.getCourses()
    .then(courses => {
        res.render('addStudent', { courses: courses });
    })
    .catch(error => {
        console.log(error);
        res.render('addStudent', { courses: [] });
    });
});

app.get('/courses/add', (req, res) => {
    res.render('addCourse');
});

//Post Route
app.post("/students/add", (req, res) => {
    const studentInfo = req.body
    cData.addStudent(studentInfo)
    .then(() => {
        cData.getAllStudents()
        .then((students) => {
            res.redirect('/students');
        })
        .catch((error) => {
            console.log({message:"No Results"});
        });
    })
    .catch((error) => {
        console.log({message:"no results"});
    });
});

//Post Route for Adding the Course
app.post("/courses/add", (req, res) => {
    const courseInfo = req.body
    cData.addCourse(courseInfo)
    .then(() => {
        cData.getCourses()
        .then(() => {
            res.redirect('/courses')
        })
        .catch((error) => {
            console.log({message:"No Results"});
        });
    })
    .catch((error) => {
        console.log({message:"no results"});
    });
});

// Post route for student update
app.post("/student/update", (req, res) => {
    const studentData = req.body;
    cData.updateStudent(studentData)
    .then(() => {
        res.redirect('/students');
    })
    .catch((error) => {
        console.log({message:"no results"});
    });
});

//Post Route for Course Update
app.post("/course/update", (req, res) => {
    const courseData = req.body;
    cData.updateStudent(courseData)
    .then(() => {
        res.redirect('/courses')
    })
    .catch((error) => {
        console.log({message:"no results"});
    });
});

app.use((req,res) => {
    res.status(404);
    res.send(`<h1>Error 404: Page Not Found </h1>`);
})

cData.initialize()
.then(() => {
    // setup http server to listen on HTTP_PORT
    app.listen(HTTP_PORT, ()=> {console.log("server listening on port: " + HTTP_PORT);
    });
})

.catch((err) => { 
    console.log('Initialization Failed');
});
