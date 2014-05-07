var fs = require('fs');
var mongoose = require('mongoose');
var relative = require('../config.js').relative;
var config = require('../config.js').config;

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

exports.initdbTag = function(callback) { 
    var conn = mongoose.connection;
    // drop database 
    conn.db.dropDatabase(function(err){ 
        if(err) { 
            return callback(err); 
        }

        var tags = [];
        for (i = 0; i<10; i++) {
            tags.push({name:'tag' + i});
        }

        conn.collection('tags').insert(tags, function(err, docs) {
            callback(err);
        }); 
    }); 
};

exports.initdbPicture = function(callback) { 
    var conn = mongoose.connection;
    // drop database 
    conn.db.dropDatabase(function(err){ 
        if(err) { 
            return callback(err); 
        }

        var pictures = [];
        pictures.push({
            name: 'picture1',
            path: relative.IMAGE_DIR + '/test1.jpeg',
            url : '/test1.jpeg',
            type: 'jpeg',
            articleIds: ['id1','id2']
        });
        pictures.push({
            name: 'picture2',
            path: relative.IMAGE_DIR + '/test2.jpeg',
            url : '/test2.jpeg',
            type: 'jpeg',
            articleIds: ['id1']
        });
        pictures.push({
            name: 'picture3',
            path: relative.IMAGE_DIR + '/test3.jpeg',
            url : '/test3.jpeg',
            type: 'jpeg',
            articleIds: ['id2']
        });


        fs.writeFileSync(relative.IMAGE_DIR + '/test1.jpeg', 'test jpeg file.');
        fs.writeFileSync(relative.IMAGE_DIR + '/test2.jpeg', 'test jpeg file.');
        fs.writeFileSync(relative.IMAGE_DIR + '/test3.jpeg', 'test jpeg file.');
        fs.writeFileSync(config.MULTIPARTY_OPTIONS.uploadDir + '/test_temp.jpeg', 'test temp jpeg file.');

        conn.collection('pictures').insert(pictures, function(err, docs) {
            callback(err);
        }); 
    }); 
};

exports.afterPicture = function(callback) {
    if (fs.existsSync(config.MULTIPARTY_OPTIONS.uploadDir + '/test_temp.jpeg')) {
        fs.unlinkSync(config.MULTIPARTY_OPTIONS.uploadDir + '/test_temp.jpeg');
    }

    var files = fs.readdirSync(relative.IMAGE_DIR);
    files.filter(function(file) {
        return file.split('.')[1] === 'jpeg';
    }).forEach(function(file) {
        fs.unlinkSync(relative.IMAGE_DIR + '/' + file);
    });

    callback();
};