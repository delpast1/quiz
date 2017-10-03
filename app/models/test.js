'use strict';
var mongoose = require('../config/index').db;
var Schema = mongoose.Schema;

module.exports = mongoose.model('Test', new Schema({
    name: String,
    content: [String],
    teacherId: String
}));