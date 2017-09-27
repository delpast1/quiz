var mongoose = require('mongoose');

mongoose.connect('mongodb://delpast1:delpast1@ds151544.mlab.com:51544/quiz', {useMongoClient: true});

exports = module.exports = mongoose;