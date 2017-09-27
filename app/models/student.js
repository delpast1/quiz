var mongoose = require('../config/index').db;
var Schema = mongoose.Schema;
var info = require('mUser');
var test = require('mTest');

module.exports = mongoose.model('Student', new Schema({
    personalInfo: info,
    role: {type: String, default: 'Student'},
    tests: [{
        testId: String,
        result: [{
            file: String
        }]
    }]
}));