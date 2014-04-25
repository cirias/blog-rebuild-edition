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
			res.send(Article.aftertreat(results));
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
		Article.remove(id, function(err) {
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
	var article = Article.pretreat(req.body);

	if (!article._id) {
		var verifyMsg = Article.verify(req.body);
		if (verifyMsg.length != 0) {
			res.send({success: false, msg: verifyMsg});
			return;
		}

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
				res.send({success: true, msg: message.UPDATE_SUCCESS});
			}
		})
	}
}

//删除文章
exports.removeArticle = function(req, res) {
	if (!req.query.id) {
		res.send({success: false, msg: message.MISSING_ID});
		return;
	}

	Article.remove(req.query.id, function(err) {
		if (err) {
			res.send({success: false, msg: err});
		} else {
			res.send({success: true, msg: message.REMOVE_SUCCESS});
		}
	});
}