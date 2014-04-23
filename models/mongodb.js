var config = require('../config').config;

var mongoose = require('mongoose');
mongoose.connect(config.DB_CONNECTION);
exports.mongoose = mongoose;