var Tag = require('./../models/Tag.js');
var Article = require('./../models/Article.js');

exports.getTags = function(req, res) {
	Tag.selectAll(function(err, results) {
		if (err) {
			res.send({success: false, msg: err});
		} else {
			res.send(results);
		}
	});
}

exports.getArticle = function(req, res) {
	if (req.query.alias) {
		Article.selectByAlias(req.query.alias, Article.CONTENT_FIELDS, function(err, article) {
			if (err) {
				res.send({success: false, msg: err});
			} else {
				res.send(article);
			}
		});
	}
}

exports.getArticles = function(req, res) {
	Article.selectArray(req.query.pageNum, req.query.count, Article.CONTENT_FIELDS.join(' '), function(err, results) {
		if (err) {
			res.send({success: false, msg: err});
		} else {
			res.send(results);
		}
	});
}