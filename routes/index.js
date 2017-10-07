var express = require('express');
var router = express.Router();
var user = require('../app/user/index').user;
var test = require('../app/test/index').test;
var authenticate = require('../app/middleware/index').authenticate;

// const maxSize = 1*1024*1024; // 1 MB
// var multer = require('multer');
// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null,'./upload');
//     },
//     filename: (req, file, cb) => {
//         cb(null,file.originalname);
//     }
// });
// var upload = multer({
//     storage: storage,
//     limits: {fileSize: maxSize}
// });


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// User
router.post('/signin', user.login);
router.post('/signup', user.insertUser);
router.post('/update-information', [authenticate.requireSession, user.updateUserInfo]);
router.post('/change-password', [authenticate.requireSession, user.updatePassword]);
router.get('/user-info', [authenticate.requireSession, user.getUser]);
router.post('/teacher/get-student-info', [authenticate.requireTeacher, user.teacherGetStudentInfo]);

// Test
router.post('/get-test', test.getTest);
router.get('/get-tests', test.getTests);
// router.post('/get-tests-by-teacherId', test.getTestsByTeacherId);
router.post('/teacher/new-test', [authenticate.requireTeacher, test.insertTest]);
router.get('/get-my-tests', [authenticate.requireSession, test.getMyTests]);
router.post('/student/load-test', [authenticate.requireStudent, test.loadTest]);
router.post('/student/join-test', [authenticate.requireStudent, test.joinTest]);
router.post('/teacher/load-result', [authenticate.requireTeacher, test.loadResult]);
router.post('/get-answer', [authenticate.requireSession, test.getAnswer]);

//Result

router.post('/student/save-answer', [authenticate.requireStudent, test.saveAnswer]);
// router.post('/teacher/get-result', [authenticate.requireTeacher, result.getResult]);


module.exports = router;
