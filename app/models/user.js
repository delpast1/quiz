'use strict';
var mongoose = require('../config/index').db;
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({
    email: {type: String, unique: true},
    password: String,
    fullname: String,
    birthdate: Date,
    role: String,
    notices: [{
        testId: String,
        studentId: String,
        name: String,
        seen: Number
    }]
}));