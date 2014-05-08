var request = require('supertest');
var app = require('../app.js');
var helper = require('./helper');
var mongoose = require('mongoose');
var User = require('../models/User.js');
var config = require('../config.js').config;
var async = require('async');
var Article = require('../models/Article.js');


describe('route admin', function(done) {
	var account = {
		username: 'user_1',
		password: 'password_1'
	};

	var cookie;
	var articles;

    before(function(done) {
    	async.series([
		    function(cb) { helper.close(cb); },
		    function(cb) { helper.connect(cb); },
		    function(cb) { helper.initdb(cb); },
		    function(cb) { new User(account).save(cb); },
		    function(cb) { 
		    	account.remember = true;
		    	request(app)
				.post('/login')
				.send(account)
				.end(function (err, res) {
					console.log(res.body.success);
					cookie = res.headers['set-cookie'];
					cb();
				});
			}
		], function(err, results) {
		    done(err);
		});
    });

	after(function(done) { 
        helper.close(done);
    });

	beforeEach(function(done) {
		async.series({
		    a: function(cb) { helper.insertArticles(cb); },
		    b: function(cb) { Article.find({}, cb); }
		}, function(err, results) {
			articles = results.b;
		    done(err);
		});
    });
    afterEach(function(done) {
        helper.removeArticles(done);
    });

	describe('GET /articles #getArticleInfos()', function() {
		it('should return all of the article informations.', function(done) {
			request(app)
			.get('/articles')
			.set('cookie', cookie)
			.expect(200)
			.end(function(err, res) {
				res.body.should.have.lengthOf(20);
				done();
			});
		});
	});

	describe('PUT /articles #updateArticles()', function() {
		it('should update these articles\' hidden field.', function(done) {
			var articleIds = articles.map(function(article) {
				return String(article._id);
			});

			request(app)
			.put('/articles')
			.set('cookie', cookie)
			.query({articleIds: articleIds, data: {hidden: true}})
			.expect(200)
			.end(function(err, res) {
				res.body.success.should.be.true;

				Article.find({_id: {$in: articleIds}}, function(err, docs) {
					if (err) return done(err);

					docs.forEach(function(doc) {
						doc.hidden.should.be.true;
					});

					done();
				});
			});
		});

		it('should not success.', function(done) {
			var articleIds = articles.map(function(article) {
				return String(article._id);
			});

			request(app)
			.put('/articles')
			.set('cookie', cookie)
			.query()
			.expect(200)
			.end(function(err, res) {
				res.body.success.should.be.false;
				done();
			});
		});
	});

	describe('DELETE /articles #removeArticles()', function() {
		it('should delete these articles.', function(done) {
			var articleIds = articles.map(function(article) {
				return String(article._id);
			});

			request(app)
			.del('/articles')
			.set('cookie', cookie)
			.query({articleIds: articleIds})
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);

				res.body.success.should.be.true;

				Article.find({_id: {$in: articleIds}}, function(err, docs) {
					if (err) return done(err);

					docs.should.be.empty;

					done();
				});
			});
		});

		it('should delete these articles.', function(done) {
			var articleIds = articles.map(function(article) {
				return String(article._id);
			});

			request(app)
			.del('/articles')
			.set('cookie', cookie)
			.query()
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);

				res.body.success.should.be.false;

				done();
			});
		});
	});

	describe('GET /article #getArticle()', function() {
		it('should return all of the article informations.', function(done) {
			request(app)
			.get('/article')
			.set('cookie', cookie)
			.query({alias: articles[2].alias})
			.expect(200)
			.end(function(err, res) {
				for (var key in res.body) {
					if (key === '_id') continue;
					res.body[key].should.be.eql(articles[2][key]);
				}

				done();
			});
		});
	});
	
});