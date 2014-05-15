var Tag = require('./../models/Tag.js');
var Article = require('./../models/Article.js');

exports.getTags = function(req, res) {
	Tag.selectAll(Tag.status, function(err, results) {
		if (err) {
			res.send({success: false, msg: err});
		} else {
			res.send(results);
		}
	});
}

exports.getDates = function(req, res) {
	Article.getDates(Article.status, function(err, dates) {
		if (err) {
			res.send({success: false, msg: err});
		} else {
			res.send(dates);
		}
	});
}

exports.getArticleCount = function(req, res) {
	Article.count({}, function(err, count) {
		if (err) {
			res.send({success: false, msg: err});
		} else {
			res.send({count: count});
		}
	});
}

exports.getArticle = function(req, res) {
	Article.findOne({'alias': req.query.alias})
	.select(Article.CONTENT_FIELDS.join(' '))
	.exec(function(err, article) {
		if (err) {
			res.send({success: false, msg: err});
		} else {
			res.send(article);
		}
	});
};

exports.getArticles = function(req, res) {
	if (typeof req.query.query === 'string') {
		req.query.query = JSON.parse(req.query.query) || {};
	} else {
		req.query.query = req.query.query || {};
	}

	req.query.query.hidden = false;

	Article.selectArray(req.query, Article.CONTENT_FIELDS.join(' '), function(err, results) {
		if (err) {
			console.log(err);
			res.send({success: false, msg: err});
		} else {
			res.send(results);
		}
	});
}