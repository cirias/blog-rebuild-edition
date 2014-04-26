// var async = require('async');
var mongodb = require('./mongodb');
var marked = require('marked');
var message = require('../config.js').message;
var utils = require('../utils.js');

var Schema = mongodb.mongoose.Schema;
var ArticleSchema = new Schema(
    {
        title :             String,
        alias :             String,
        tags :              {type: [String], default: ['default']},
        createDate :        {type: Date, default: Date.now},
        modifyDate :        {type: Date, default: Date.now},
        hidden :            {type: Boolean, default: true},
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
    if (!article._id) {
        callback(message.MISSING_ID);
        return;
    }
    
    var _id = article._id;
    delete article._id;
    Article.findByIdAndUpdate(_id, article, {}, function(err) {
        callback(err);
    });
}

//删除文章
ArticleDAO.prototype.remove = function(id, callback) {
    Article.remove({_id: id}, function(err){
        callback(err);
    });
}

//预处理文章
ArticleDAO.prototype.pretreat = function(article, callback) {
    if (article.mdContent) article.htmlcontent = marked(article.mdContent);

    return article;
}

//后处理文章
ArticleDAO.prototype.aftertreat = function(articles, callback) {
    function treatdata(article) {
        var treadedArticle = {};
        var Keys = [];
        Article.schema.eachPath(function(key) {
            Keys.push(key);
        });

        for (key in article) {
            if (Keys.indexOf(key) == -1) continue;
            if (key == 'createDate' && article.createDate) {treadedArticle.createDate = article.createDate.format('yyyy-MM-dd'); continue;}
            if (key == 'modifyDate' && article.modifyDate) {treadedArticle.modifyDate = article.modifyDate.format('yyyy-MM-dd'); continue;}

            treadedArticle[key] = article[key];
        }
        return treadedArticle;
    }

    if (Array.isArray(articles)) {
        var treadedArticles = [];
        articles.forEach(function(article) {
            treadedArticles.push(treatdata(article));
        });
        
        return treadedArticles;
    } else {
        return treatdata(articles);
    }
}

//验证文章
ArticleDAO.prototype.verify = function(article, callback) {
    var verifyMsg = [];

    if (!article.title) verifyMsg.push(message.MISSING_TITLE);
    if (!article.alias) verifyMsg.push(message.MISSING_ALIAS);
    // if (!article.tags) verifyMsg.push(message.MISSING_TAGS);
    if (!article.createDate) verifyMsg.push(message.MISSING_CDATE);
    if (!article.modifyDate) verifyMsg.push(message.MISSING_MDATE);
    if (!article.mdContent) verifyMsg.push(message.MISSING_MCONTENT);
    if (!article.htmlcontent && typeof article.htmlcontent !== 'undefined') verifyMsg.push(message.MISSING_HCONTENT);
    if (!article.metaKeywords) verifyMsg.push(message.MISSING_MKEYWORDS);
    if (!article.metaDescription) verifyMsg.push(message.MISSING_MDESCRIPTION);

    return verifyMsg;
}