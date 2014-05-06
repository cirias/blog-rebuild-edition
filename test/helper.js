var mongoose = require('mongoose');
exports.DB = 'mongodb://localhost/test';
exports.connect = function(callback) { 
    mongoose.connect(exports.DB, callback); 
};
exports.close = function(callback) { 
    mongoose.connection.close(callback); 
};
exports.getConnection = function() { 
    return mongoose.connection; 
};
exports.initdb = function(callback) { 
    var conn = mongoose.connection;
    // drop database 
    conn.db.dropDatabase(function(err){ 
        if(err) { 
            return callback(err); 
        }
        // console.log('Database droped.');
        // insert articles 

        var articles = [];
        var articleTemplate = {
            title :             'title',
            alias :             'alias',
            tags :              ['tag'],
            createDate :        Date.now,
            modifyDate :        Date.now,
            hidden :            true,
            mdContent :         '#Content',
            htmlContent :       '<h1>Content</h1>',
            hits :              0,
            metaKeywords :      'keywords',
            metaDescription :   'description',
            imageIds :          []
        }

        for (j = 0; j<20; j++) {
            var article = Object.create(articleTemplate);
            article.title = article.title + j;
            article.alias = article.alias + j;
            article.tags = getRandomTags();
            article.hidden = Math.random() > 0.5;
            article.createDate = getRandomDate();
            article.modifyDate = getRandomDate();
            articles.push(article);
        }

        conn.collection('articles').insert(articles, function(err, docs) { 
            // insert others 
            // console.log('insert success.');
            callback(err);
        }); 
    }); 
};

var getRandomTags = function() {
    var tagsTemplate = [];
    for (i = 0; i<10; i++) {
        tagsTemplate.push('tag' + i);
    }

    var tags = [];
    var count = Math.floor(Math.random()*5);

    for (i = 0; i<=count; ) {
        var tag = tagsTemplate[Math.floor(Math.random()*10)];
        if (tags.indexOf(tag) < 0) {
            tags.push(tag);
            i++;
        }
    }

    return tags;
};

var getRandomDate = function() {
    var year = 2013 + Math.floor(Math.random()*2);
    var month = Math.ceil(Math.random()*12);
    var day = Math.ceil(Math.random()*31);
    return new Date(year + '-' + month + '-' + day);
};