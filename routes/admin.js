var async = require('async');
var multiparty = require('multiparty');
// var Recaptcha = require('recaptcha').Recaptcha;
var Article = require('./../models/Article.js');
var Picture = require('./../models/Picture.js');
var Tag = require('./../models/Tag.js');
var message = require('../config.js').message;
var config = require('../config.js').config;
var utils = require('../utils.js');
// var Tag = require('./../models/Tag.js');
// var User = require('./../models/User.js');

//获取文章信息
exports.getArticleInfos = function(req, res) {
	Article.selectArray(config.ARTICLE_INFO_FIELDS, function(err, results) {
		if (err) {
			res.send({success: false, msg: err});
		} else {
			res.send(results);
		}
	});
}

//批量更新
exports.updateArticles = function(req, res) {
	async.each(req.body.articles, function(article, callback) {
		Article.update(article, function(err) {
			callback(err);
		});
	}, function(err) {
		if (err) {
			res.send({success: false, msg: err});
		} else {
			res.send({success: true, msg: message.UPDATE_SUCCESS});
		}
	});
}

//批量删除
exports.removeArticles = function(req, res) {
	async.each(req.query.articleIds, function(id, callback) {
		Article.removeById(id, function(err) {
			callback(err);
		});
	}, function(err) {
		if (err) {
			res.send({success: false, msg: err});
		} else {
			res.send({success: true, msg: message.REMOVE_SUCCESS});
		}
	});
}

//提交文章
exports.postArticle = function(req, res) {
	var article = req.body;

	if (!article._id) {
		async.parallel([
			function(callback) { Article.insert(article, callback); },
			function(callback) { Tag.saveNews(article.tags, callback); }
		], function(err) {
			if (err) {
				res.send({success: false, msg: err});
			} else {
				res.send({success: true, msg: message.INSERT_SUCCESS});
			}
		});
	} else {
		async.parallel([
			function(callback) { Article.update(article, callback); },
			function(callback) { Tag.saveNews(article.tags, callback); }
		], function(err) {
			if (err) {
				res.send({success: false, msg: err});
			} else {
				res.send({success: true, msg: message.UPDATE_SUCCESS});
			}
		});
	}
}

//删除文章
exports.removeArticle = function(req, res) {
	Article.removeById(req.query.id, function(err) {
		if (err) {
			res.send({success: false, msg: err});
		} else {
			res.send({success: true, msg: message.REMOVE_SUCCESS});
		}
	});
}

exports.saveImage = function (req, res) {
	var form = new multiparty.Form(config.MULTIPARTY_OPTIONS);

	form.parse(req, function(err, fields, files){
		if (err) {
			res.send({success: false, msg: err});
		}
		
		var file = {};
		file.name = files.file[0].originalFilename;
		file.type = files.file[0].headers['content-type'] || null;
		file.path = files.file[0].path;
		file.size = files.file[0].size;

		var verifyMsg = Picture.verify(file);
		if (verifyMsg.length != 0) {
			res.send({success: false, msg: verifyMsg});
			return;
		}

		Picture.save(file, function(err, data) {
			if (err) {
				res.send({success: false, msg: err});
			} else {
				res.send({success: true, msg: message.UPLOAD_IMAGE_SUCCESS, image: data});
			}

			utils.deleteContentsInDir(config.MULTIPARTY_OPTIONS.uploadDir);
		});
	});
}