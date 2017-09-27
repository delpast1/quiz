'use strict';
var teacher = require('./teacher');
var student = require('./student');
var quiz = require('./quiz');
var test = require('./test');
var user = require('./user');

exports = module.exports = {
    teacher: teacher,
    student: student,
    quiz: quiz,
    test: test,
    user: user
}