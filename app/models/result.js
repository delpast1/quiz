'use strict';
var mongoose = require('../config/index').db;
var Schema = mongoose.Schema;

module.exports = mongoose.model('Result', new Schema({
    testId: String,
    studentId: String,
    testLength: Number,
    answers: [{
        index: Number,
        file: String
    }],
    status: Number
}));