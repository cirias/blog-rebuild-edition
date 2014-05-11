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

// 保存前
ArticleSchema.pre('save', function(next) {
    var article = this;

    // 若mdContent修改过，则重新生成htmlContent
    if (!article.isModified('mdContent')) return next();

    article.htmlContent = marked(article.mdContent);
    next();
});

// 保存后
ArticleSchema.post('save', function() {
    // 设置文章变动
    Article.status.setNotFresh();
});

ArticleSchema.methods.updateTo = function(newArticle, callback) {
    var article = this;

    if (typeof newArticle !== 'object') {
        return callback(new TypeError());
    }

    // 遍历更新属性，跳过id
    for (var key in newArticle) {
        if (key === '_id') continue;
        article[key] = newArticle[key];
    }    
    
    // 保存
    article.save(callback);
};

// 设置静态变量
ArticleSchema.static('FIELDS', Object.keys(ArticleSchema.eachPath(function(){}).paths));

ArticleSchema.static('INFO_FIELDS', ['title', 'createDate', 'hidden', 'hits', 'alias', 'tags']);

ArticleSchema.static('CONTENT_FIELDS', ['title', 'alias', 'createDate', 'tags', 'htmlContent', 'metaDescription', 'metaKeywords']);

// 文章是否变动过
ArticleSchema.static('status', (function() {
    var fresh = false;
    return {
        getFresh: function() {return this.fresh;},
        setFresh: function() {this.fresh = true;},
        setNotFresh: function() {this.fresh = false;}
    }
})());

// 获取时间队列
ArticleSchema.static('getDates', utils.memoizer(function(callback) {
    Article.find({}, 'createDate').sort({createDate: '-1'}).exec(function(err, articles) {
        var dates = [];

        // 遍历每篇文章
        for (var i = 0; i < articles.length; i++) {
            var month = articles[i].createDate.getMonth();
            var year = articles[i].createDate.getFullYear();
            var date = message.MONTH_NAMES[month] + ' ' + year;
            var has = false;

            // 遍历已有时间队列
            for (var j = 0; j < dates.length; j++) {
                // 若存在重复
                if (dates[j].date === date) {
                    has = true;
                    break;
                }
            }

            if (!has) {
                // 不重复则加入队列
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

// 查询文章数组
ArticleSchema.static('selectArray', function(params, fields, callback) {
    if (typeof params !== "object") {
        return callback(new TypeError('params is not an object.'));
    }

    params = params || {};
    pageNum = params.pageNum || 1;
    count = params.count || Infinity;

    query = params.query;
    pageNum = Number(pageNum);
    count = Number(count);

    if (isNaN(pageNum)) {
        return callback(new TypeError('pageNum is not an number.'));
    }

    if (isNaN(count)) {
        return callback(new TypeError('count is not an number.'));
    }

    // 转化query为JSON对象
    if (typeof query === "string") {
        query = JSON.parse(query) || {};
    }
    
    // 查询符合query，按createDate倒序，最大数量为count，跳过前(pageNum - 1) * count个
    Article.find(query).select(fields).sort({createDate: '-1'}).skip((pageNum - 1) * count).limit(count).exec(callback);
});

var Article = mongodb.mongoose.model("Article", ArticleSchema);
var ArticleDAO = function(){};
module.exports = Article;