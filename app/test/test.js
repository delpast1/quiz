'use strict';
var Test = require('../models/index').test;
var Result = require('../models/index').result;
var jwt = require('jsonwebtoken');
const key = require('../config/index').key;

var insertTest = (req, res) => {
    var name = req.body.name,
        content = req.body.content,
        teacherId = req.decoded.id,
        role = req.decoded.role;

    var errors = [];
    var workflow = new (require('events').EventEmitter)();

    workflow.on('validateParams', ()=> {
        if (!name){
            errors.push('Name of test required');
        };
        if (content.length === 0){
            errors.push('Content of test required');
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
            content: content,
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
        Test.findById(testId, (err, test) => {
            if (err) {
                res.json({
                    errors: err
                });
            } else {
                res.json({
                    id: testId,
                    name: test.name,
                    teacherId: test.teacherId,
                    content: test.content
                });
            }
        });
    });

    workflow.emit('validateParams');
}

//
var getTests = (req, res) => {
    Test.find({}, (err, tests) => {
        if (err) {
            res.json({
                errors: err
            });
        } else {
            res.json(tests);
        }
    })
}

//
var getTestsByTeacherId = (req, res) => {
    var teacherId = req.body.teacherId;
    var workflow = new (require('events').EventEmitter)();
    var errors = [];
    workflow.on('validateParams', ()=> {
        if (!teacherId){
            errors.push('Test ID required');
        };
        
        if (errors.length){
            workflow.emit('errors', errors);
        } else {
            workflow.emit('getTests');
        };
    });

    workflow.on('errors', (errors)=> {
        res.json({ 
            errors: errors
        });
    });

    workflow.on('getTests', () => {
        Test.find({teacherId: teacherId}, (err, tests) => {
            if (err) {
                res.json({
                    errors: err
                });
            } else {
                res.json(tests);
            }
        });
    });

    workflow.emit('validateParams');
}

//
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
                workflow.emit('checkResultStatus');
            };
        });

        workflow.on('errors', (errors)=> {
            res.json({ 
                errors: errors
            });
        });

        workflow.on('checkResultStatus', () => {
            Result.find({testId: testId, studentId: studentId}, (err, result) => {
                if (err) {
                    res.json({
                        errors: err
                    });
                }
                if (result.length === 0 ){
                    errors.push('You\' not joint this test');
                    workflow.emit('errors', errors);
                } else if (result[0].status !== 0){
                    errors.push('You\'ve finished this test already.');
                    workflow.emit('errors', errors);
                } else {
                    var length = result[0].answers.length;
                    if (length === 0) {
                        var index = -1;
                        workflow.emit('getTest', index);
                    } else {
                        var index = result[0].answers[length-1].index
                        workflow.emit('getTest', index);
                    }
                }
            });
        });

        workflow.on('getTest', (index) => {
            Test.findById(testId, (err, test) => {
                if (err) {
                    res.json({
                        errors: err
                    });
                }
                res.json({
                    index: index,
                    test: test
                })
            });
        });
    
    workflow.emit('validateParams');
}
//
var getTestList = (req, res) => {
    var teacherId = req.decoded.id;
    Test.find({teacherId: teacherId}, (err, tests) => {
        if (err) {
            res.json({
                errors: err
            }); 
        } else {
            res.json(tests);
        }
    });
}

exports = module.exports = {
    insertTest: insertTest,
    getTestList: getTestList,
    getTest: getTest,
    getTests:getTests,
    loadTest: loadTest,
    getTestsByTeacherId: getTestsByTeacherId
}