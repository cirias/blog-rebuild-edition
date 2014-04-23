// var async = require('async');
var mongodb = require('./mongodb');

var Schema = mongodb.mongoose.Schema;
var ArticleSchema = new Schema(
    {
        title : String,
        tags : [String],
        date : {type: Date, default: Date.now},
        dir : String,
        hidden : Boolean,
        oriContent : String,
        content : String
    }
);
var Article = mongodb.mongoose.model("Article", ArticleSchema);
var ArticleDAO = function(){};
module.exports = new ArticleDAO();

//返回文章信息数组
ArticleDAO.prototype.SelectInfos = function(fields, callback) {
	Article.find({}).select(fields).sort({date: '-1'}).exec(function(err, articles){
		callback(err, articles);
	});
}