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
		Article.selectOneByAlias(req.query.alias, function(err, article) {
			if (err) {
				res.send({success: false, msg: err});
			} else {
				res.send(Article.aftertreat(article));
			}
		});
	}
}