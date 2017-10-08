'use strict';
var mongoose = require('../config/index').db;
var Schema = mongoose.Schema;

module.exports = mongoose.model('Test', new Schema({
    name: String,
    contents: [{
        question: String
    }],
    teacherId: String,
    results: [{
        studentId: {type: String, sparse: true},
        answers: [{
            questionId: String,
            fileName: String,
            score: Number
        }],
        status: Number
    }]
}));