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

	app.get('/', function(request, response, next) {
		response.sendfile('app/index.html');
	});

	app.get('/tags', common.getTags);

	app.get('/dates', common.getDates);

	app.get('/com/article', common.getArticle);
	app.get('/com/articles', common.getArticles);

	app.get('/login', function(req, res) {
		res.sendfile('app/login.html');
	});
	app.post('/login', admin.login);

	app.all(/^\/dashboard$|^\/articles$|^\/article$|^\/image$|^\/siteinfo$/, admin.authenticate);

	app.get('/dashboard', function(request, response, next) {
		response.sendfile('app/dashboard.html');
	});

	app.get('/articles', admin.getArticleInfos);
	app.put('/articles', admin.updateArticles);
	app.del('/articles', admin.removeArticles);

	app.post('/article', admin.postArticle);
	app.put('/article', admin.updateArticle);
	app.get('/article', admin.getArticle);
	app.del('/article', admin.removeArticle);

	app.post('/image', admin.saveImage);

	app.post('/siteinfo', admin.saveSiteInfo);
}