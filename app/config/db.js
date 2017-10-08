var mongoose = require('mongoose');

mongoose.connect('mongodb://delpast1:123456@ds145389.mlab.com:45389/quiz', {useMongoClient: true});

exports = module.exports = mongoose;