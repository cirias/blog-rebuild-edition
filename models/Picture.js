var fs = require('fs');
var path = require('path');
var async = require('async');
var mongodb = require('./mongodb.js');
var message = require('../config.js').message;
var config = require('../config.js').config;
var relative = require('../config.js').relative;
// var utils = require('../utils.js');

var Schema = mongodb.mongoose.Schema;
var PictureSchema = new Schema(
    {
        name :              {type: String, required: true},
        path :              {type: String, required: true},
        url :               {type: String, required: true},
        type :              {type: String, required: true, enum: ['jpeg', 'bmp', 'png', 'gif']},
        articleIds :        {type: [String], default: []}
    }
);

PictureSchema.pre('remove', function(next) {
    var picture = this;

    if (fs.existsSync(picture.path)) {
        fs.unlinkSync(picture.path);
    }

    next();
});

PictureSchema.methods.pretreat = function() {
    this.path = path.join(relative.IMAGE_DIR, this._id+'.'+this.type);
    this.url = path.join(config.IMAGE_SUB_DIR, this._id+'.'+this.type);

    return this;
};

PictureSchema.methods.postreat = function(originPath, callback) {
    if (typeof originPath !== 'string') {
        return this.remove(function() {
            callback(new TypeError('originPath is not a path string.'));
        });
    }

    if (!fs.existsSync(originPath)) {
        return this.remove(function() {
            callback(new Error({name:'PathError',message:'originPath is not exsit.'}));
        });
    }

    try {
        fs.renameSync(originPath, this.path); 
    } catch (err) {
        return this.remove(callback);
    }

    return callback(null, this);
};

PictureSchema.static('insertAndSave', function(file, callback) {
    new Picture(file).pretreat().save(function(err, picture) {
        if (err) {
            return callback(err);
        } else {
            picture.postreat(file.originPath, callback);
        }
    });
});

PictureSchema.static('updateByArticleIds', function(ids, articleId, callback) {
    if (typeof articleId !== 'string') return callback(new TypeError());

    Picture.find({_id: {$in: ids}}).exec(function(err, pictures) {
        if (err) {
            return callback(err);
        }

        async.each(pictures.filter(function(picture) {
            return picture.articleIds.indexOf(articleId) < 0;
        }), function(picture, callback) {
            Picture.findOne({_id: picture._id}).exec(function(err, picture) {
                picture.articleIds.push(articleId);
                picture.save(callback);
            });
        }, function(err) {
            if (err) {
                return callback(err);
            } else {
                return callback(null);
            }
        });
    });
});

PictureSchema.static('removeByArticleIds', function(articleId, callback) {
    if (typeof articleId !== 'string') return callback(new TypeError());

    Picture.find({articleIds: articleId}).exec(function(err, pictures) {
        if (err) {
            callback(err);
            return;
        }

        async.each(pictures, function(picture, callback) {
            Picture.findOne({_id: picture._id}).exec(function(err, picture) {
                picture.articleIds.pop(articleId);

                if (picture.articleIds.length === 0) {
                    picture.remove(callback);
                } else {
                    picture.save(callback);
                }
            });
        }, function(err) {
            if (err) {
                return callback(err);
            } else {
                return callback(null);
            }
        });
    });
});

var Picture = mongodb.mongoose.model("Picture", PictureSchema);
var PictureDAO = function(){};
module.exports = Picture;