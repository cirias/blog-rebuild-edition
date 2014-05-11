var fs = require('fs');
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var relative = require('../config.js').relative;
var config = require('../config.js').config;

exports.connect = function(callback) {
    mongoose.connect(config.DB_CONNECTION, callback);
};
exports.close = function(callback) {
    mongoose.connection.close(callback);
};
exports.getConnection = function() {
    return mongoose.connection;
};
exports.initdb = function(callback) {
    mongoose.connection.db.dropDatabase(callback);
};

exports.insertArticles = function(callback) {
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
    };

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

    mongoose.connection.collection('articles').insert(articles, function(err, docs) {
        callback(err);
    });
};

exports.removeArticles = function(callback) {
    mongoose.connection.collection('articles').remove({}, function(err) {
        callback(err);
    });
};

exports.insertTags = function(callback) {
    var tags = [];
    for (i = 0; i<10; i++) {
        tags.push({name:'tag' + i});
    }

    mongoose.connection.collection('tags').insert(tags, function(err, docs) {
        callback(err);
    });
};

exports.removeTags = function(callback) {
    mongoose.connection.collection('tags').remove({}, function(err) {
        callback(err);
    });
};

exports.insertPictures = function(callback) {
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
    pictures.push({
        name: 'picture4',
        path: relative.IMAGE_DIR + '/test4.jpeg',
        url : '/test4.jpeg',
        type: 'jpeg',
        articleIds: []
    });
    pictures.push({
        name: 'picture5',
        path: relative.IMAGE_DIR + '/test5.jpeg',
        url : '/test5.jpeg',
        type: 'jpeg',
        articleIds: []
    });
    pictures.push({
        name: 'picture6',
        path: relative.IMAGE_DIR + '/test6.jpeg',
        url : '/test6.jpeg',
        type: 'jpeg',
        articleIds: []
    });


    fs.writeFileSync(relative.IMAGE_DIR + '/test1.jpeg', 'test jpeg file.');
    fs.writeFileSync(relative.IMAGE_DIR + '/test2.jpeg', 'test jpeg file.');
    fs.writeFileSync(relative.IMAGE_DIR + '/test3.jpeg', 'test jpeg file.');
    fs.writeFileSync(relative.IMAGE_DIR + '/test4.jpeg', 'test jpeg file.');
    fs.writeFileSync(relative.IMAGE_DIR + '/test5.jpeg', 'test jpeg file.');
    fs.writeFileSync(relative.IMAGE_DIR + '/test6.jpeg', 'test jpeg file.');
    fs.writeFileSync(config.MULTIPARTY_OPTIONS.uploadDir + '/test_temp.jpeg', 'test temp jpeg file.');

    mongoose.connection.collection('pictures').insert(pictures, function(err, docs) {
        callback(err);
    });
};

exports.prepareImages = function(callback) {
    fs.writeFileSync(__dirname + '/test1.jpeg', 'test jpeg file.');
    fs.writeFileSync(__dirname + '/test2.jpeg', 'test jpeg file.');
    fs.writeFileSync(__dirname + '/test3.jpeg', 'test jpeg file.');
    fs.writeFileSync(__dirname + '/test1.notjpeg', 'test notjpeg file.');
    callback();
};

exports.removePictures = function(callback) {
    // if (fs.existsSync(config.MULTIPARTY_OPTIONS.uploadDir + '/test_temp.jpeg')) {
    //     fs.unlinkSync(config.MULTIPARTY_OPTIONS.uploadDir + '/test_temp.jpeg');
    // }

    var files = fs.readdirSync(__dirname);
    files.filter(function(file) {
        return file.split('.')[1] === 'jpeg' || file.split('.')[1] === 'notjpeg';
    }).forEach(function(file) {
        fs.unlinkSync(__dirname + '/' + file);
    });

    var files = fs.readdirSync(config.MULTIPARTY_OPTIONS.uploadDir);
    files.filter(function(file) {
        return file.split('.')[1] === 'jpeg';
    }).forEach(function(file) {
        fs.unlinkSync(config.MULTIPARTY_OPTIONS.uploadDir + '/' + file);
    });

    var files = fs.readdirSync(relative.IMAGE_DIR);
    files.filter(function(file) {
        return file.split('.')[1] === 'jpeg';
    }).forEach(function(file) {
        fs.unlinkSync(relative.IMAGE_DIR + '/' + file);
    });

    mongoose.connection.collection('pictures').remove({}, function(err) {
        callback(err);
    });
};

exports.insertUser = function(user, callback) {
    bcrypt.genSalt(config.SALT_WORK_FACTOR, function(err, salt) {
        if (err) return callback(err);

        // 用salt生成密码哈希值
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return callback(err);

            // 用哈希值替代用户密码
            user.password = hash;

            mongoose.connection.collection('users').insert([user], function(err, docs) {
                callback(err);
            });
        });
    });
};

exports.removeUser = function(callback) {
    mongoose.connection.collection('users').remove({}, function(err) {
        callback(err);
    });
};