'use strict';

var User = require('../models/index').user;
var jwt = require('jsonwebtoken');
const key = require('../config/index').key;

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
                    token: token
                });
            }

        });
    });

    workflow.emit('validateParams');
};

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
                    token: token
                });
            }
        });
    });

    workflow.emit('validateParams');
}

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

exports = module.exports = {
    insertUser: insertUser,
    updateUserInfo: updateUserInfo,
    updatePassword: updatePassword,
    login: login
}