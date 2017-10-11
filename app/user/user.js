'use strict';

var User = require('../models/index').user;
var Test = require('../models/index').test;
var jwt = require('jsonwebtoken');
const key = require('../config/index').key;

//
var login = (req, res) => {
    var email = req.body.email,
        password = req.body.password;

    var errors = [];
    var token = '';
    var workflow = new (require('events').EventEmitter)();

    workflow.on('validateParams', ()=> {
        if (!email){
            errors.push('Email required');
        };
        if (!password){
            errors.push('Password required');
        };
        
        if (errors.length){
            workflow.emit('errors', errors);
        } else {
            workflow.emit('login');
        };
    });

    workflow.on('errors', (errors)=> {
        res.json({ 
            errors: errors
        });
    });

    workflow.on('login', () => {
        User.findOne({email: email}, (err, user) => {
            if (err) {
                res.json({
                    errors: err
                });
            };
            if (!user) {
                errors.push('This email has been not registered.');
                workflow.emit('errors', errors);
            } else if (user.password !== password ) {
                errors.push('Wrong password.');
                workflow.emit('errors', errors);
            } else {
                var sign = {
                    id: user._id,
                    email: user.email,
                    role: user.role
                };
                var token = jwt.sign(sign, key, {});
    
                res.json({
                    errors: errors,
                    userInfo: {
                        userId: user._id,
                        email: user.email,
                        fullname: user.fullname,
                        birthdate: user.birthdate,
                        role: user.role
                    },
                    token: token
                });
            }

        });
    });

    workflow.emit('validateParams');
};

//
var insertUser = (req, res) => {
    var email = req.body.email,
        password = req.body.password,
        fullname = req.body.fullname,
        birthdate = req.body.birthdate,
        role = req.body.role;

    var errors = [];
    var token = '';
    var workflow = new (require('events').EventEmitter)();

    workflow.on('validateParams', ()=> {
        if (!email){
            errors.push('Email required');
        };
        if (!password){
            errors.push('Password required');
        };
        if (!fullname){
            errors.push('Fullname required');
        };
        if (!birthdate){
            errors.push('Birthdate required');
        };
        if (!role){
            errors.push('Role required');
        } else if (role !== 'teacher' && role !== 'student') {
            errors.push('This role is not available.')
        };
        
        if (errors.length){
            workflow.emit('errors', errors);
        } else {
            workflow.emit('insert');
        }
    });

    workflow.on('errors', (errors)=> {
        res.json({ 
            errors: errors
        });
    });

    workflow.on('insert', () => {
        var date =  Date.parse(birthdate)+ 7*60*60*1000;
    
        var user = new User({
            email: email,
            password: password,
            fullname: fullname,
            birthdate: date,
            role: role
        });

        user.save((err) => {
            if (err) {
                errors.push('This email was used.');
                workflow.emit('errors', errors);
            } else {
                var sign = {
                    id: user._id,
                    email: user.email,
                    role: user.role
                };
                var token = jwt.sign(sign, key, {});
    
                res.json({
                    errors: errors,
                    userInfo: {
                        userId: user._id,
                        email: user.email,
                        fullname: user.fullname,
                        birthdate: user.birthdate,
                        role: user.role
                    },
                    token: token
                });
            }
        });
    });

    workflow.emit('validateParams');
}

//
var updateUserInfo = (req, res) => {
    var fullname = req.body.fullname,
    birthdate = req.body.birthdate,
    id = req.decoded.id;

    var errors = [];
    var token = '';
    var workflow = new (require('events').EventEmitter)();

    workflow.on('validateParams', ()=> {
        if (!fullname){
            errors.push('Fullname required');
        };
        if (!birthdate){
            errors.push('Birthdate required');
        };
        
        if (errors.length){
            workflow.emit('errors', errors);
        } else {
            workflow.emit('update');
        }
    }); 

    workflow.on('errors', (errors)=> {
        res.json({ 
            errors: errors
        });
    });

    workflow.on('update', () => {
        User.findById(id, (err, user) => {
            if (err) {
                res.json({
                    errors: err
                });
            };
            var date =  Date.parse(birthdate)+ 7*60*60*1000;
            user.fullname = fullname;
            user.birthdate = date;
            user.save((err) => {
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
        });
    });

    workflow.emit('validateParams');
}

//
var updatePassword = (req, res) => {
    var password = req.body.currentPassword,
        newPassword = req.body.newPassword,
        confirmPassword = req.body.confirmPassword,
        id = req.decoded.id;

    var errors = [];
    var token = '';
    var workflow = new (require('events').EventEmitter)();

    workflow.on('validateParams', ()=> {
        if (!password){
            errors.push('Current Password required');
        };
        if (!newPassword){
            errors.push('New Password required');
        };
        if (!confirmPassword){
            errors.push('Confirm Password required');
        } else if (confirmPassword !== newPassword) {
            errors.push('Passwords does not match.');
        }
        
        if (errors.length){
            workflow.emit('errors', errors);
        } else {
            workflow.emit('update');
        };
    }); 

    workflow.on('errors', (errors)=> {
        res.json({ 
            errors: errors
        });
    });

    workflow.on('update', () => {
        User.findById(id, (err, user) => {
            if (err) {
                res.json({
                    errors: err
                });
            };
            if (user.password !== password) {
                errors.push('Current Password is wrong.');
                workflow.emit('errors', errors);
            } else {
                user.password = newPassword;
                user.save((err) => {
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
            }
        });
    });
    workflow.emit('validateParams');
}

//
var getUser = (req,res) => {
    var id = req.body.id;
    var errors = [];
    var workflow = new (require('events').EventEmitter)();

    workflow.on('validateParams', ()=> {
        if (!id){
            errors.push('id required');
        };
        
        if (errors.length){
            workflow.emit('errors', errors);
        } else {
            workflow.emit('getUser');
        };
    }); 

    workflow.on('errors', (errors)=> {
    res.json({ 
            errors: errors
        });
    });
    
    workflow.on('getUser', () => {
        User.findById(id, (err, user) => {
            if (err) {
                return res.json(err);
            } 
            if (user) {
                res.json({
                    email: user.email,
                    fullname: user.fullname,
                    birthdate: user.birthdate,
                    role: user.role,
                    tests: user.tests
                });
            } else {
                errors.push('This user is not available.');
                return workflow.emit('errors', errors);
            }
        });
    });

    workflow.emit('validateParams');
}

//
var getUserByToken = (req, res) => {
    var id = req.decoded.id;

    User.findById(id, (err, user) => {
        if (err) {
            return res.json(err);
        } 
        if (user) {
            res.json({
                userId: user._id,
                email: user.email,
                fullname: user.fullname,
                birthdate: user.birthdate,
                role: user.role,
                tests: user.tests,
                notices: user.notices
            });
        } else {
            res.json({
                errors: ['This user is not available.']
            })
        }
    });
}

//
var teacherGetStudentInfo = (req,res) => {
    var studentId = req.body.studentId;

    var workflow = new (require('events').EventEmitter)();
    var errors = [];
    workflow.on('validateParams', ()=> {
        if (!studentId){
            errors.push('Student ID required');
        };
        
        if (errors.length){
            workflow.emit('errors', errors);
        } else {
            workflow.emit('getStudent');
        };
    });

    workflow.on('errors', (errors)=> {
        res.json({ 
            errors: errors
        });
    });

    workflow.on('getStudent', () => {
        User.findById(studentId, (err, user) => {
            if (err) {
                res.json({
                    errors: err
                });
            } else if (user.role !== 'student') {
                errors.push('This is not a student, you don\'t have permision.');
                workflow.emit('errors', errors);
            } else {
                res.json(user);
            }
        });
    });
    workflow.emit('validateParams');
}

//
var getUnseenNotices = (req,res) => {
    var id = req.decoded.id;
    User.findById(id, (err, user) => {
        if (err) {
            res.json(err);
        }
        
        var unseenNotices = [];
        if (user.notices.length !== 0){
            for(var i=0; i< user.notices.length; i++) {
                if (user.notices[i].seen === 0) {
                    unseenNotices.push(user.notices[i]);
                }
            }
            res.json(unseenNotices);
        } else {
            res.json(unseenNotices);
        }
    }); 
}

// 
var getSeenNotices = (req,res) => {
    var id = req.decoded.id;
    User.findById(id, (err, user) => {
        if (err) {
            res.json(err);
        }
        
        var seenNotices = [];
        if (user.notices.length !== 0){
            for(var i=0; i< user.notices.length; i++) {
                if (user.notices[i].seen !== 0) {
                    seenNotices.push(user.notices[i]);
                }
            }
            res.json(seenNotices);
        } else {
            res.json(seenNotices);
        }
    }); 
}

//
var getNotice = (req, res) => {
    var id = req.decoded.id,
        studentId = req.body.studentId,
        testId = req.body.testId;

    var workflow = new (require('events').EventEmitter)();
    var errors = [];
    workflow.on('validateParams', ()=> {
        if (!studentId){
            errors.push('studentId required');
        };
        if (!testId){
            errors.push('testId required');
        };
        
        if (errors.length){
            workflow.emit('errors', errors);
        } else {
            workflow.emit('getNotice');
        };
    });

    workflow.on('errors', (errors)=> {
        res.json({ 
            errors: errors
        });
    });

    workflow.on('getNotice', () => {
        User.findById(id, (err, user) => {
            if (err) {
                return res.json(err);
            }
            if (user.notices.length !== 0 ) {
                for(var i=0; i < user.notices.length; i++) {
                    if (user.notices[i].testId === testId && user.notices[i].studentId === studentId) {
                        user.notices[i].seen = 1;
                        break;
                    }
                }
                user.save((err) => {
                    if (err) {
                        return res.json(err);
                    }
                });
                workflow.emit('loadResult');
            } else {
                errors.push('Wrong person.');
                workflow.emit('errors', errors);
            }
        });
    });

    workflow.on('loadResult', () => {
        Test.findOne({'_id': testId, 'teacherId': id}, (err, test) => {
            if (err) {
                return res.json(err);
            }
            
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
        }); 
    });

    workflow.emit('validateParams');
}


exports = module.exports = {
    insertUser: insertUser,
    updateUserInfo: updateUserInfo,
    updatePassword: updatePassword,
    login: login,
    getUser: getUser,
    getUserByToken: getUserByToken,
    teacherGetStudentInfo: teacherGetStudentInfo,
    getUnseenNotices: getUnseenNotices,
    getSeenNotices: getSeenNotices,
    getNotice: getNotice
}