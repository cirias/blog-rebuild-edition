var Tag = require('./../models/Tag.js');

exports.getTags = function(req, res) {
	Tag.SelectAll(function(err, results) {
		if (err) {
			res.send('ERROR: 500\n' + err);
			return;
		}
		
		res.send(results);
	});
}