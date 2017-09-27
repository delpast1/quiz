'use strict';

var Teacher = require('../models/index').teacher;
var User = require('../models/index').user;

var insertTeacher = (req, res) => {
    var email = req.body.email,
        password = req.body.password,
        fullname = req.body.fullname,
        birthdate = req.body.birthdate;
    
    var info = new User({
        email: email,
        password: password,
        fullname: fullname,
        birthdate: Date.parse(birthdate),
        role: 'teacher'
    });

    var teacher = new Teacher({
        personalInfo: info
    });

    teacher.save((err) => {
        if (err) throw err;
        res.json({
            'message': 'good' 
        });
    });

}