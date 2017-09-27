var mongoose = require('../config/index').db;
var Schema = mongoose.Schema;
var info = require('user');
var test = require('tests');

module.exports = mongoose.model('Student', new Schema({
    personalInfo: info,
    tests: [{
        testId: String,
        result: [{
            file: String
        }]
    }]
}));