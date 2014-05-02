var async = require('async');
var mongodb = require('./mongodb.js');
var utils = require('../utils.js');
var Schema = mongodb.mongoose.Schema;

var TagSchema = new Schema(
    {
        name : {type: String, required: true, unique: true},
        hidden : {type: Boolean, default: true}
    }
);

TagSchema.static('status', (function() {
	var fresh = false;
	return {
		getFresh: function() {return this.fresh;},
		setFresh: function() {this.fresh = true;},
		setNotFresh: function() {this.fresh = false;}
	}
})());

TagSchema.static('selectAll', utils.memoizer(function(callback) {
    Tag.find({}).exec(callback);
}));

TagSchema.static('saveNews', function(newTags, callback){
	this.find({}).exec(function(err, tags) {
		if (err) return callback(err);

		async.each(newTags.filter(function(newTag) {
			return tags.map(function(tag) {
					return tag.name;
				}).indexOf(newTag) < 0;
		}), function(newTag, callback) {
			new Tag({ name: newTag }).save(callback);
		}, function(err) {
			Tag.status.setNotFresh();
			callback(err);
		});
	});
});

var Tag = mongodb.mongoose.model('Tag', TagSchema);
module.exports = Tag;