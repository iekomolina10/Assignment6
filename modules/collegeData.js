const Sequelize = require('sequelize');
var sequelize = new Sequelize('btwfegln', 'btwfegln', 'cZcqimt1PSAjwygXYdaNb-dzuadz5wRf', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query:{ raw: true }
});

sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });
    
// Define a "Student" model
var Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

// Define "Course" model
var Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

//Define Relationship
Course.hasMany(Student, {foreignKey: 'course'});

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                resolve();
            })
            .catch(error => {
                reject("unable to sync the database");
            });
    });
};

module.exports.getAllStudents = function(){
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then(students => {
                if (students.length > 0) {
                    resolve(students);
                } else {
                    reject("no results returned");
                }
            })
            .catch(error => {
                reject("no results returned");
            });
    });
};

module.exports.getCourses = function(){
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then(courses => {
                if (courses.length > 0) {
                    resolve(courses);
                } else {
                    reject("no results returned");
                }
            })
            .catch(error => {
                reject("no results returned");
            });
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise(function(resolve, reject) {
        Student.findAll({
            where: {
                studentNum: num
            }
        })
            .then(students => {
                if (students.length > 0) {
                    resolve(students[0]);
                } else {
                    reject("no results returned");
                }
            })
            .catch(error => {
                reject("no results returned");
            });
    });
};

module.exports.getStudentsByCourse = function (course) {
    return new Promise(function(resolve, reject) {
        Student.findAll({
            where: {
                course: course
            }
        })
            .then(students => {
                if (students.length > 0) {
                    resolve(students);
                } else {
                    reject("no results returned");
                }
            })
            .catch(error => {
                reject("no results returned");
            });
    });
};

module.exports.addStudent = function (studentData) {
    return new Promise(function(resolve, reject) {
        if (studentData.TA === undefined) {
            studentData.TA = false;
          } else {
            studentData.TA = true;
          }
        
        for (const property in studentData) {
            if (studentData[property] === "") {
                studentData[property] = null;
            }
        }
        
        Student.create(studentData)
            .then(() => {
                resolve();
            })
            .catch(error => {
                reject("unable to create student");
            });
    });
};

//Add Course Function
module.exports.addCourse = function(courseData) {
    return new Promise(function(resolve, reject) {
        for (const property in courseData) {
            if (courseData[property] === "") {
                courseData[property] = null;
            }
        }
        
        Course.create(courseData)
            .then(() => {
                resolve();
            })
            .catch(error => {
                reject("unable to create course");
            });
    });
};

//Update Course
module.exports.updateCourse = function(courseData) {
    return new Promise(function(resolve, reject) {
        for (const property in courseData) {
            if (courseData[property] === "") {
                courseData[property] = null;
            }
        }
        
        const courseId = courseData.courseId;

        Course.update(courseData, {
            where: {
                courseId: courseId
            }
        })
            .then(() => {
                resolve();
            })
            .catch(error => {
                reject("unable to update course");
            });
    });
};

//Delete Course
module.exports.deleteCourseById = function(id) {
    return new Promise(function(resolve, reject) {
        Course.destroy({
            where: {
                courseId: id
            }
        })
            .then(affectedRows => {
                if (affectedRows > 0) {
                    resolve();
                } else {
                    reject("course not found");
                }
            })
            .catch(error => {
                reject("unable to delete course");
            });
    });
};

module.exports.getCourseById = function (id) {
    return new Promise(function(resolve, reject) {
        Course.findAll({
            where: {
                courseId: id
            }
        })
            .then(courses => {
                if (courses.length > 0) {
                    resolve(courses[0]);
                } else {
                    reject("no results returned");
                }
            })
            .catch(error => {
                reject("no results returned");
            });
    });
};

module.exports.updateStudent = function (studentData) {
    return new Promise(function(resolve, reject) {
        studentData.TA = studentData.TA ? true : false;

        for (const property in studentData) {
            if (studentData[property] === "") {
                studentData[property] = null;
            }
        }
        
        const studentNum = studentData.studentNum;

        Student.update(studentData, {
            where: {
                studentNum: studentNum
            }
        })
            .then(() => {
                resolve();
            })
            .catch(error => {
                reject("unable to update student");
            });
    });
};

//Delete student by num
module.exports.deleteStudentByNum = function(studentNum) {
    return new Promise(function(resolve, reject) {
        Student.destroy({
            where: {
                studentNum: studentNum
            }
        })
            .then(affectedRows => {
                if (affectedRows > 0) {
                    resolve();
                } else {
                    reject("student not found");
                }
            })
            .catch(error => {
                reject("unable to delete student");
            });
    });
};

