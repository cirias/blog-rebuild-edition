var async = require('async');
var marked = require('marked');
// var Recaptcha = require('recaptcha').Recaptcha;
var Article = require('./../models/Article.js');
// var Tag = require('./../models/Tag.js');
// var User = require('./../models/User.js');

exports.getArticleInfos = function(req, res) {
	Article.SelectInfos('title date hidden', function(err, results) {
		if (err) {
			res.send('ERROR: 500\n' + err);
			return;
		}

		res.send(results);
	});
}

exports.postArticle = function(req, res) {
	if (!req.params.id) {
		console.log(req.body);
		res.send({success: true, msg: 'success'});
	}
}