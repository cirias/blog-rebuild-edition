var admin = require('./routes/admin');
var common = require('./routes/common');

module.exports = function(app) {
	app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    if ('OPTIONS' == req.method){
        	return res.send(200);
	    }
	    next();
	});

	app.get('/articleInfos', admin.getArticleInfos);

	app.get('/tags', common.getTags);

	app.post('/article/:id', admin.postArticle);

	app.post('/article', admin.postArticle);
}