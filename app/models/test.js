var mongoose = require('../config/index').db;
var Schema = mongoose.Schema;
var quiz = require('quiz');

module.exports = mongoose.model('Test', new Schema({
    name: "String",
    quizs: [quiz]
}));