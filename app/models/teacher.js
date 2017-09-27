var mongoose = require('../config/index').db;
var Schema = mongoose.Schema;
var info = require('user');
var test = require('test');

module.exports = mongoose.model('Teacher', new Schema({
    personalInfo: info,
    tests: [test]
}));