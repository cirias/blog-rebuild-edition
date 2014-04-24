var Tag = require('./../models/Tag.js');
var Article = require('./../models/Article.js');

exports.getTags = function(req, res) {
	Tag.SelectAll(function(err, results) {
		if (err) {
			res.send('ERROR: 500\n' + err);
			return;
		}
		
		res.send(results);
	});
}

exports.getArticle = function(req, res) {
	if (req.query.alias) {
		Article.selectOneByAlias(req.query.alias, function(err, article) {
			if (err) {
				res.send({success: false, msg: err});
			} else {
				console.log(article);
				res.send(article);
			}
		});
	}
}