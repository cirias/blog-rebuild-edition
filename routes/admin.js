var async = require('async');
// var Recaptcha = require('recaptcha').Recaptcha;
var Article = require('./../models/Article.js');
var message = require('../config.js').message;
var config = require('../config.js').config;
// var Tag = require('./../models/Tag.js');
// var User = require('./../models/User.js');

//获取文章信息
exports.getArticleInfos = function(req, res) {
	Article.selectInfos(config.ARTICLE_INFO_FIELDS, function(err, results) {
		if (err) {
			res.send({success: false, msg: err});
		} else {
			res.send(results);
		}
	});
}

//提交文章
exports.postArticle = function(req, res) {
	var verifyMsg = Article.verify(req.body);

	if (verifyMsg.length != 0) {
		res.send({success: false, msg: verifyMsg});
		return;
	}

	var article = Article.pretreat(req.body);

	if (!article._id) {
		Article.insert(article, function(err) {
			if (err) {
				res.send({success: false, msg: err});
			} else {
				res.send({success: true, msg: message.INSERT_SUCCESS});
			}
		})
	} else {
		Article.update(article, function(err) {
			if (err) {
				res.send({success: false, msg: err});
			} else {
				res.send({success: true, msg: message.INSERT_SUCCESS});
			}
		})
	}
}