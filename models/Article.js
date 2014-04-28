// var async = require('async');
var mongodb = require('./mongodb');
var marked = require('marked');
var message = require('../config.js').message;
var utils = require('../utils.js');

var Schema = mongodb.mongoose.Schema;

var ArticleSchema = new Schema(
    {
        title :             {type: String, required: true},
        alias :             {type: String, required: true, unique: true},
        tags :              {type: [String]},
        createDate :        {type: Date, required: true, default: Date.now},
        modifyDate :        {type: Date, required: true, default: Date.now},
        hidden :            {type: Boolean, required: true, default: true},
        mdContent :         {type: String, required: true},
        htmlContent :       {type: String, required: true},
        hits :              {type: Number, required: true, default: 0},
        metaKeywords :      {type: String},
        metaDescription :   {type: String},
        imageIds :          {type: [String]}
    }
);

ArticleSchema.pre('save', function(next) {
    var article = this;

    if (!article.isModified('htmlContent')) return next();

    article.htmlContent = marked(article.mdContent);
    next();
});

ArticleSchema.static('selectArray', function(fields, callback) {
    Article.find({}).select(fields).sort({createDate: '-1'}).exec(function(err, articles) {
        var treatedArticles = [];
        articles.forEach(function(article) {
            treatedArticles.push(treat(article));
        });
        callback(err, treatedArticles);
    });
});

ArticleSchema.static('insert', function(article, callback) {
    // if (article.mdContent) article.htmlContent = marked(article.mdContent);
    
    new Article(article).save(callback);
});

ArticleSchema.static('update', function(newArticle, callback) {
    if (!newArticle._id) return callback(message.MISSING_ID);
    // if (newArticle.mdContent) newArticle.htmlContent = marked(newArticle.mdContent);
    
    Article.findOne({_id: newArticle._id}, function(err, article) {
        if (err) return callback(err);
        for(var key in newArticle) {
            if (key == '_id') continue;
            article[key] = newArticle[key];
        }
        article.save(callback);
    });
});

ArticleSchema.static('removeById', function(id, callback) {
    if (!id) return callback(message.MISSING_ID);

    Article.remove({_id: id}, callback);
});

ArticleSchema.static('selectByAlias', function(alias, callback) {
    Article.findOne({'alias': alias}, function(err, article) {
        callback(err, treat(article));
    });
});

var Article = mongodb.mongoose.model("Article", ArticleSchema);
var ArticleDAO = function(){};
module.exports = Article;

function treat(article) {
    var treadedArticle = {};
    var Keys = [];
    Article.schema.eachPath(function(key) {
        Keys.push(key);
    });

    for (var key in article) {
        if (Keys.indexOf(key) == -1) continue;
        if (key == 'createDate' && article.createDate) {treadedArticle.createDate = article.createDate.format('yyyy-MM-dd'); continue;}
        if (key == 'modifyDate' && article.modifyDate) {treadedArticle.modifyDate = article.modifyDate.format('yyyy-MM-dd'); continue;}

        treadedArticle[key] = article[key];
    }
    return treadedArticle;
}