var mongoose = require('../config/index').db;
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({
    email: String,
    password: String,
    fullname: String,
    birthdate: Date,
    role: String
}));