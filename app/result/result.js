'use strict';
var Result = require('../models/index').result;
var Test = require('../models/index').test;

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

//
var joinTest = (req,res) => {
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
            Result.find({testId: testId, studentId: studentId}, (err, result) => {
                if (err) {
                    res.json({
                        errors: err
                    });
                }
                
                if (result.length === 0) {
                    workflow.emit('getTestInfo');
                } else {
                    errors.push('You\'ve joint this test already.')
                    workflow.emit('errors', errors);
                }
            });
        };
    });

    workflow.on('errors', (errors)=> {
        res.json({ 
            errors: errors
        });
    });


    workflow.on('getTestInfo', () => { 
        Test.findById(testId, (err, test) => {
            var testLength = test.content.length;
            test.students
            workflow.emit('createResult', testLength );
        }); 
    });

    workflow.on('createResult', (testLength) => {
        var result = new Result();
        result.testId = testId;
        result.studentId = studentId;
        result.status = 0;
        result.testLength = testLength;
        result.save((err) => {
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
};


var saveAnswer = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.json({
                errors: 'Error uploading file.'
            });
        }
        
        var testId = req.body.testId,
            index = req.body.index,
            studentId = req.decoded.id;

        var errors = [];
        var workflow = new (require('events').EventEmitter)();
        workflow.on('validateParams', ()=> {
            if (!testId){
                errors.push('Test ID required');
            };
            if (!index){
                errors.push('Index required');
            };
            
            if (errors.length){
                workflow.emit('errors', errors);
            } else {
                workflow.emit('updateResult');
            };
        });

        workflow.on('errors', (errors)=> {
            res.json({ 
                errors: errors
            });
        });

        workflow.on('updateResult', () => {
            Result.find({testId: testId, studentId: studentId}, (err, result) => {
                if (err) {
                    return res.json({
                        errors: err
                    });
                }
                if (result.length === 0) {
                    errors.push('You\'ve not joint this test.');
                    workflow.emit('errors', errors);
                } else {
                    result[0].answers.push({
                        index: index,
                        file: req.file.originalname
                    });
                    var checker = result[0].testLength - 1;

                    if (index==checker) {
                        result[0].status = 1;
                    }
                    result[0].save((err) => {
                        if (err) {
                            res.json({
                                errors: err
                            })
                        } else {
                            res.json({
                                errors: errors
                            });
                        }
                    }) ;
                }
            });
        });

        workflow.emit('validateParams');
    }); 
}

//
var getResult = (req, res) =>{
    
}

exports = module.exports = {
    joinTest: joinTest,
    saveAnswer: saveAnswer
}