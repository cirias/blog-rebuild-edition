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
        name :              String,
        path :              String,
        url :               String,
        type :              String, 
        articleIds :         {type: [String], default: []}
    }
);

PictureSchema.pre('save', function(next) {
    var picture = this;

    picture.path = path.join(relative.IMAGE_DIR, picture._id+'.'+picture.type);
    picture.url = path.join(config.IMAGE_SUB_DIR, picture._id+'.'+picture.type);

    next();
});

PictureSchema.pre('remove', function(next) {
    var picture = this;

    if (fs.existsSync(picture.path)) {
        fs.unlinkSync(picture.path);
    }

    next();
});

PictureSchema.static('updateByArticleIds', function(ids, articleId, callback) {
    Picture.find({_id: {$in: ids}}).exec(function(err, pictures) {
        if (err) {
            callback(err);
            return;
        }

        pictures.forEach(function(picture) {
            if (picture.articleIds.indexOf(articleId) < 0 ) {
                picture.articleIds.push(articleId);
                picture.save(callback);
            }
        });
    });
});

PictureSchema.static('removeByArticleIds', function(ids, articleId, callback) {
    Picture.find({_id: {$in: ids}}).exec(function(err, pictures) {
        if (err) {
            callback(err);
            return;
        }

        pictures.forEach(function(picture) {
            if (picture.articleIds.indexOf(articleId) > 0 ) {
                picture.articleIds.pop(articleId);
            }

            if (picture.articleIds.length === 0) {
                picture.remove(callback);
            }
        });
    });
});

var Picture = mongodb.mongoose.model("Picture", PictureSchema);
var PictureDAO = function(){};
module.exports = new PictureDAO();

PictureDAO.prototype.save = function(picture, callback) {
    var newPicture = new Picture({
        name: picture.name,
        type: picture.type.split('/')[1].toLowerCase()
    });

    newPicture.path = path.join(relative.IMAGE_DIR, newPicture._id+'.'+newPicture.type);
    newPicture.url = path.join(config.IMAGE_SUB_DIR, newPicture._id+'.'+newPicture.type);

    async.series([
        function(callback) {
            newPicture.save(function(err) {
                callback(err);
            });
        },
        function(callback) {
            fs.rename(picture.path, newPicture.path, function(err) {
                if (err) {
                    newPicture.remove(function(error) {
                        err.remove = error;
                    });
                }
                callback(err);
            });
        }
    ], function(err) {
        callback(err, newPicture);
    });
}

PictureDAO.prototype.remove = function(id, callback) {
    Picture.find({_id: id}).exec(function(err, picture) {
        if (err) {
            callback(err);
            return;
        }

        if (!picture) {
            callback(message.WRONG_ID);
            return;
        }

        if (fs.existsSync(picture.path)) {
            fs.unlinkSync(picture.path);
        }

        picture.remove(function(err) {
            callback(err);
        })
    });
};

PictureDAO.prototype.verify = function(file) {
    var verifyMsg = [];

    if ('image' != file.type.split('/')[0]) verifyMsg.push(message.NOT_IMAGE);

    return verifyMsg;
};