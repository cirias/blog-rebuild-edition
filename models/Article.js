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
ArticleSchema.static('selectArray', function(query, pageNum, count, fields, callback) {
    // 转化query为JSON对象
    if (typeof query === "string") {
        query = JSON.parse(query) || {};
    }
    
    pageNum = pageNum || 1;
    count = count || Infinity;
    
    // 查询符合query，按createDate倒序，最大数量为count，跳过前(pageNum - 1) * count个
    Article.find(query).select(fields).sort({createDate: '-1'}).skip((pageNum - 1) * count).limit(count).exec(callback);
});

// 插入文章
// ArticleSchema.static('insert', function(article, callback) {
//     new Article(article).save(function(err, article) {
//         if (err) return callback(err);

//         // 设置文章变动
//         Article.status.setNotFresh();

//         Picture.updateByArticleIds(article.imageIds, article._id, function(err) {
//             if (err) return callback(err);
//         });

//         callback(null);
//     });
// });

// 更新文章
ArticleSchema.static('updateById', function(newArticle, callback) {
    if (!newArticle._id) return callback(message.MISSING_ID);
    
    // 根据id查找文章
    Article.findOne({_id: newArticle._id}, function(err, article) {
        if (err) return callback(err);

        // 遍历更新属性，跳过id
        for(var key in newArticle) {
            if (key === '_id') continue;
            article[key] = newArticle[key];
        }

        // 保存
        article.save(callback);
    });
});

// 根据id删除文章
ArticleSchema.static('removeById', function(id, callback) {
    if (!id) return callback(message.MISSING_ID);

    Article.remove({_id: id}, callback);
});

// 根据alias查找一篇文章
ArticleSchema.static('selectByAlias', function(alias, fields, callback) {
    fields = fields || Article.FIELDS.join(' ');
    Article.findOne({'alias': alias}).select(fields).exec(callback);
});

var Article = mongodb.mongoose.model("Article", ArticleSchema);
var ArticleDAO = function(){};
module.exports = Article;