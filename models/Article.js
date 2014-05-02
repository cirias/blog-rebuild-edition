// var async = require('async');
var mongodb = require('./mongodb.js');
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

ArticleSchema.static('FIELDS', Object.keys(ArticleSchema.eachPath(function(){}).paths));

ArticleSchema.static('INFO_FIELDS', ['title', 'createDate', 'hidden', 'hits', 'alias', 'tags']);

ArticleSchema.static('CONTENT_FIELDS', ['title', 'alias', 'createDate', 'tags', 'htmlContent', 'metaDescription', 'metaKeywords']);

ArticleSchema.static('status', (function() {
    var fresh = false;
    return {
        getFresh: function() {return this.fresh;},
        setFresh: function() {this.fresh = true;},
        setNotFresh: function() {this.fresh = false;}
    }
})());

ArticleSchema.static('getDates', utils.memoizer(function(callback) {
    Article.find({}, 'createDate').sort({createDate: '-1'}).exec(function(err, articles) {
        var dates = [];
        for (var i = 0; i < articles.length; i++) {
            var month = articles[i].createDate.getMonth();
            var year = articles[i].createDate.getFullYear();
            var date = message.MONTH_NAMES[month] + ' ' + year;
            var has = false;

            for (var j = 0; j < dates.length; j++) {
                if (dates[j].date == date) {
                    has = true;
                    break;
                }
            }

            if (!has) {
                dates.push({
                    date: date,
                    month: month + 1,
                    year: year
                });
            }
        }
        callback(err, dates);
    });
}));

ArticleSchema.static('selectArray', function(query, pageNum, count, fields, callback) {
    if (typeof query == "string") {
        query = JSON.parse(query) || {};
    }
    
    pageNum = pageNum || 1;
    count = count || Infinity;
    
    Article.find(query).select(fields).sort({createDate: '-1'}).skip((pageNum - 1) * count).limit(count).exec(callback);
});

ArticleSchema.static('insert', function(article, callback) {
    new Article(article).save(function(err) {
        Article.status.setNotFresh();
        callback(err);
    });
});

ArticleSchema.static('update', function(newArticle, callback) {
    if (!newArticle._id) return callback(message.MISSING_ID);
    
    Article.findOne({_id: newArticle._id}, function(err, article) {
        if (err) return callback(err);
        for(var key in newArticle) {
            if (key == '_id') continue;
            article[key] = newArticle[key];
        }
        article.save(function(err) {
            Article.status.setNotFresh();
            callback(err);
        });
    });
});

ArticleSchema.static('removeById', function(id, callback) {
    if (!id) return callback(message.MISSING_ID);

    Article.remove({_id: id}, callback);
});

ArticleSchema.static('selectByAlias', function(alias, fields, callback) {
    fields = fields || Article.FIELDS.join(' ');
    Article.findOne({'alias': alias}).select(fields).exec(callback);
});

var Article = mongodb.mongoose.model("Article", ArticleSchema);
var ArticleDAO = function(){};
module.exports = Article;