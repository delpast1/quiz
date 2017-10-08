'use strict';
var Test = require('../models/index').test;
var User = require('../models/index').user;
var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');
const key = require('../config/index').key;

const maxSize = 1*1024*1024; // 1 MB
var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,'./upload');
    },
    filename: (req, file, cb) => {
        cb(null,file.originalname);
    }
});
var upload = multer({
    storage: storage,
    limits: {fileSize: maxSize}
}).single('answer');

//Thêm test mới
var insertTest = (req, res) => {
    var name = req.body.name,
        contents = req.body.contents,
        teacherId = req.decoded.id;

    var errors = [];
    var workflow = new (require('events').EventEmitter)();

    workflow.on('validateParams', ()=> {
        if (!name){
            errors.push('Name of test required');
        };
        if (contents.length === 0){
            errors.push('Contents of test required');
        };
        
        if (errors.length){
            workflow.emit('errors', errors);
       } else {
            workflow.emit('insert');
           };
    });

    workflow.on('errors', (errors)=> {
        res.json({ 
            errors: errors
       });
    });

    workflow.on('insert', () => {
    
        var test = new Test({
            name: name,
            contents: contents,
            teacherId: teacherId
       });
    
        test.save((err) => {
            if (err) {
                res.json({
                    errors: err
                })
            } else {
                res.json({
                    errors: errors
                });
            }
        });
    });

    workflow.emit('validateParams');
}

//
var getTest = (req, res) => {
    var testId = req.body.testId;
    var workflow = new (require('events').EventEmitter)();
    var errors = [];
    workflow.on('validateParams', ()=> {
        if (!testId){
            errors.push('Test ID required');
        };
        
        if (errors.length){
            workflow.emit('errors', errors);
        } else {
            workflow.emit('getTest');
        };
    });

    workflow.on('errors', (errors)=> {
        res.json({ 
            errors: errors
        });
    });

    workflow.on('getTest', () => {
        Test.findById(testId, 'name contents teacherId', (err, test) => {
            if (err) {
                res.json({
                    errors: err
                });
            } else {
                res.json(test);
            }
        });
    });

    workflow.emit('validateParams');
}

//
var getTests = (req, res) => {
    Test.find({}, 'name content teacherId', (err, tests) => {
        if (err) {
            res.json({
                errors: err
            });
        } else {
            res.json(tests);
        }
    })
}

// Giáo viên lấy những test của mình tạo, học sinh lấy những test của mình làm
var getMyTests = (req, res) => {
    var id = req.decoded.id,
        role = req.decoded.role;
    if (role === 'teacher') {
        Test.find({teacherId: id}, 'name contents', (err, tests) => {
            if (err) {
                res.json({
                    errors: err
                }); 
            } else {
                res.json(tests);
            }
        });
    } else {
        Test.find({'results.studentId': id}, {'results.$': 1}, (err, tests) => {
            if (err) {
                res.json({
                    errors: err
                }); 
            } else {
                res.json(tests);
            }
        });
    }
    
}

//Học sinh tham gia vào làm test nào đó
var joinTest = (req, res) => {
    var testId = req.body.testId,
        studentId = req.decoded.id;

        var errors = [];
        var workflow = new (require('events').EventEmitter)();
    
        workflow.on('validateParams', ()=> {
            if (!testId){
                errors.push('Test ID required');
            };
            
            if (errors.length){
                workflow.emit('errors', errors);
            } else {
                workflow.emit('checkStatus');
            };
        });
    
        workflow.on('errors', (errors)=> {
            res.json({ 
                errors: errors
            });
        });

        workflow.on('checkStatus', () => {  
            Test.findById(testId, (err, test) => {
                if (err) {
                    res.json({ 
                        errors: err
                   });
                }
                if (test.results.length === 0) {
                    test.results.push({
                        studentId: studentId,
                        answers: [],
                        status: 0
                    });
                    test.save((err) => {
                        if (err) {
                            res.json({ 
                                errors: err
                           });
                        } else {
                            res.json({
                                errors: errors
                            });
                        }
                    });
                } else {
                    var joined = false;
                    for (var i = 0; i< test.results.length; i++) {
                        if (test.results[i].studentId === studentId) {
                            joined = true;
                            break;
                        }
                    }
                    if (!joined) {
                        test.results.push({
                            studentId: studentId,
                            answers: [],
                            status: 0
                        });
                        test.save((err) => {
                            if (err) {
                                res.json({ 
                                    errors: err
                               });
                            } else {
                                res.json({
                                    errors: errors
                                });
                            }
                        });
                    } else {
                        errors.push('You\'ve joint this test already.')
                        workflow.emit('errors', errors);
                    }
                }
            });
        });

        workflow.emit('validateParams');
}

// Học sinh load test và kết quả làm bài của mình về
var loadTest = (req, res) => {
    var testId = req.body.testId,
    studentId = req.decoded.id;

    var errors = [];
    var workflow = new (require('events').EventEmitter)();

    workflow.on('validateParams', ()=> {
        if (!testId){
            errors.push('Test ID required');
        };
        
        if (errors.length){
            workflow.emit('errors', errors);
        } else {
            workflow.emit('loadTest');
        };
    });

    workflow.on('errors', (errors)=> {
        res.json({ 
            errors: errors
        });
    });

    workflow.on('loadTest', () => {
        Test.findById(testId, (err, test) => {
            if (err) {
                res.json(err);
            }
            if (!test) {
                errors.push('This test is not available.');
                workflow.emit('errors', errors);
            } else if (test.results.length === 0) {
                errors.push('You\'ve not joint this test.');
                workflow.emit('errors', errors);
            }
            for (var i=0; i< test.results.length; i++) {
                if (test.results[i].studentId === studentId){
                    res.json({
                        testId: test._id,
                        name: test.name,
                        contents: test.contents,
                        teacherId: test.teacherId,
                        result: test.results[i]
                    }); 
                }
            }
        });
    });

    workflow.emit('validateParams');
}

// Lưu câu trả lời
var saveAnswer = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.json({
                errors: 'Error uploading file.'
            });
        }
        
        var testId = req.body.testId,
            questionId = req.body.questionId,
            studentId = req.decoded.id;

        var errors = [];
        var workflow = new (require('events').EventEmitter)();
        workflow.on('validateParams', ()=> {
            if (!testId){
                errors.push('Test ID required');
            };
            if (!questionId){
                errors.push('QuestionId required');
            };
            
            if (errors.length){
                workflow.emit('errors', errors);
            } else {
                workflow.emit('addAnswer');
            };
        });

        workflow.on('errors', (errors)=> {
            fs.unlink('./upload/'+req.file.originalname, (err) => {
                if (err) {
                    res.json(err);
                }
            });
            res.json({ 
                errors: errors
            });
        });

        workflow.on('addAnswer', () => {
            Test.findById(testId, (err, test) => {
                if (err) {
                    res.json({
                        errors: err
                    });
                }
                for(var i=0; i < test.results.length; i++) {
                    var check = false;
                    if (test.results[i].studentId === studentId && test.results[i].status === 0) {
                        for(var j=0; j< test.results[i].answers.length; j++){
                            if (test.results[i].answers[j].questionId === questionId) {
                                check = true;
                                break;
                            }
                        }
                        if (!check) {
                            test.results[i].answers.push({
                                questionId: questionId,
                                fileName: req.file.originalname
                            });
                            if (test.results[i].answers.length === test.contents.length) {
                                test.results[i].status = 1;
                                notices(test.teacherId, studentId, testId);
                            }
                            test.save((err) => {
                                if (err) {
                                    res.json({
                                        errors: err
                                    });
                                }
                                res.json({
                                    errors: errors
                                });
                            });
                        } else {
                            errors.push('You\'ve answered this question already.');
                            res.json({
                                 errors: errors
                            });
                        }
                    } else {
                        errors.push('You\'ve finished this test already.');
                        res.json({
                             errors: errors
                        });
                    }
                }
            });
        });

        workflow.emit('validateParams');
    }); 
}

// Giáo viên load kết quả làm bài về xem
var loadResult = (req, res) => {
    var testId = req.body.testId,
        studentId = req.body.studentId,
        teacherId = req.decoded.id;

    var errors = [];
    var workflow = new (require('events').EventEmitter)();
    workflow.on('validateParams', ()=> {
        if (!testId){
            errors.push('Test ID required');
        };
        if (!studentId){
            errors.push('StudentId required');
        };
            
        if (errors.length){
            workflow.emit('errors', errors);
        } else {
            workflow.emit('loadResult');
        };
    });

    workflow.on('errors', (errors)=> {
        res.json({ 
            errors: errors
        });
    });

    workflow.on('loadResult', () => {
        Test.findOne({'_id': testId, 'teacherId': teacherId}, (err, test) => {
            if (err) {
                res.json(err);
            }
            
            if (!test) {
                errors.push('This test is not available.');
                workflow.emit('errors', errors);
            } else {
                var result = {};
                for (var i=0; i< test.results.length; i++) {
                    if (test.results[i].studentId === studentId) {
                        result = test.results[i];
                        break;
                    }
                }
                res.json({
                    testId: test._id,
                    name: test.name,
                    teacherId: test.teacherId,
                    result: result
                });
            }
        }); 
    });
    
    workflow.emit('validateParams');
}

//Tải về câu trả lời
var getAnswer = (req, res) => {
    var fileName = req.body.fileName;
    var url = './upload/' + fileName;
    res.download(url, fileName, (err) => {
        if (err) {
            res.json(err);
        }
    });
}

// Gửi thông báo cho giáo viên
var notices = (teacherId, studentId, testId ) => {
    User.findById(teacherId, (err, teacher) => {
        console.log(teacher);
        if (err) throw err;
        if (teacher) {
            teacher.notices.push({
                testId: testId,
                studentId: studentId,
                seen: 0
            });
            teacher.save((err) => {
                if (err) throw err;
            });
        }
        return;
    });
}



exports = module.exports = {
    insertTest: insertTest,
    getTest: getTest,
    getTests:getTests,
    getMyTests: getMyTests,
    joinTest: joinTest,
    loadTest: loadTest,
    saveAnswer: saveAnswer,
    loadResult: loadResult,
    getAnswer: getAnswer
}