var async = require('async');
var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

var TagSchema = new Schema(
    {
        name : String,
        hidden : {type: Boolean, default: 'TRUE'}
    }
);

var Tag = mongodb.mongoose.model('Tag', TagSchema);
var TagDAO = function(){};
module.exports = new TagDAO();

TagDAO.prototype.SelectAll = function(callback){
	Tag.find({}).exec(function(err, tags){
		callback(err, tags);
	});
}