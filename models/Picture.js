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
        aricleIds :         {type: [String], default: []}
    }
);

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