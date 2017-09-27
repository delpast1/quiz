var mongoose = require('../config/index').db;
var Schema = mongoose.Schema;

module.exports = mongoose.model('Quiz', new Schema({
    content: String
}));