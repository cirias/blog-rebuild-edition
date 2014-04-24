// var async = require('async');
var mongodb = require('./mongodb');
var marked = require('marked');
var message = require('../config.js').message;

var Schema = mongodb.mongoose.Schema;
var ArticleSchema = new Schema(
    {
        title :             String,
        alias :             String,
        tags :              {type: [String], default: ['default']},
        createDate :        {type: Date, default: Date.now},
        modifyDate :        {type: Date, default: Date.now},
        hidden :            Boolean,
        mdContent :         String,
        htmlcontent :       String,
        hits :              {type: Number, default: 0},
        metaKeywords :      String,
        metaDescription :   String
    }
);
var Article = mongodb.mongoose.model("Article", ArticleSchema);
var ArticleDAO = function(){};
module.exports = new ArticleDAO();

//返回文章信息数组
ArticleDAO.prototype.selectInfos = function(fields, callback) {
	Article.find({}).select(fields).sort({date: '-1'}).exec(function(err, articles){
		callback(err, articles);
	});
}

ArticleDAO.prototype.selectOneByAlias = function(alias, callback) {
    Article.findOne({'alias': alias}, function(err, article){
        callback(err, article);
    });
}

//插入新文章
ArticleDAO.prototype.insert = function(article, callback) {
    var newArticle = new Article(article);

    newArticle.save(function(err){
        callback(err);
    });
}

//更新文章
ArticleDAO.prototype.update = function(article, callback) {
    Article.findByIdAndUpdate(article._id, article, {}, function(err) {
        callback(err);
    });
}

//删除文章
ArticleDAO.prototype.delete = function(id, callback) {
    Article.remove({_id: id}, function(err){
        callback(err);
    });
}

//预处理文章
ArticleDAO.prototype.pretreat = function(article, callback) {
    article.htmlcontent = marked(article.mdContent);

    return article;
}

//验证文章
ArticleDAO.prototype.verify = function(article, callback) {
    var verifyMsg = [];

    if (!article.title && typeof article.title !== 'undefined') verifyMsg.push(message.MISSING_BODY);
    if (!article.alias && typeof article.alias !== 'undefined') verifyMsg.push(message.MISSING_BODY);
    if (!article.tags && typeof article.tags !== 'undefined') verifyMsg.push(message.MISSING_BODY);
    if (!article.createDate && typeof article.createDate !== 'undefined') verifyMsg.push(message.MISSING_BODY);
    if (!article.modifyDate && typeof article.modifyDate !== 'undefined') verifyMsg.push(message.MISSING_BODY);
    if (!article.hidden && typeof article.hidden !== 'undefined') verifyMsg.push(message.MISSING_BODY);
    if (!article.mdContent && typeof article.mdContent !== 'undefined') verifyMsg.push(message.MISSING_BODY);
    if (!article.htmlcontent && typeof article.htmlcontent !== 'undefined') verifyMsg.push(message.MISSING_BODY);
    if (!article.metaKeywords && typeof article.metaKeywords !== 'undefined') verifyMsg.push(message.MISSING_BODY);
    if (!article.metaDescription && typeof article.metaDescription !== 'undefined') verifyMsg.push(message.MISSING_BODY);

    return verifyMsg;
}