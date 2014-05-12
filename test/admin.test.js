var request = require('supertest');
var app = require('../app.js');
var helper = require('./helper');
var mongoose = require('mongoose');
var User = require('../models/User.js');
var config = require('../config.js').config;
var async = require('async');
var Article = require('../models/Article.js');
var Picture = require('../models/Picture.js');
var Tag = require('../models/Tag.js');

// describe('route common', function() {

// });

describe('route admin', function() {
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

    describe('GET /tags #getTags()', function() {
    	before(function(done) {
    		helper.insertTags(done);
    	});

    	after(function(done) {
    		helper.removeTags(done);
    	});

    	it('should return all tags.', function(done) {
    		request(app)
			.get('/tags')
			.expect(200)
			.end(function(err, res) {
				res.body.should.have.lengthOf(10);
				done();
			});
    	});
    });

    describe('GET /dates #getDates()', function() {
    	it('should return all tags.', function(done) {
    		request(app)
			.get('/dates')
			.expect(200)
			.end(function(err, res) {
				res.body.length.should.be.above(0);
				done();
			});
    	});
    });

    describe('GET /com/article #getArticle()', function() {
    	it('should return all tags.', function(done) {
    		request(app)
			.get('/com/article')
			.query({alias: 'alias1'})
			.expect(200)
			.end(function(err, res) {
				res.body.alias.should.be.eql('alias1');
				done();
			});
    	});
    });

    describe('GET /com/articles #getArticles()', function() {
    	it('should return all tags.', function(done) {
    		request(app)
			.get('/com/articles')
			.query({
				query: {},
				pageNum: 1,
				count: 5
			})
			.expect(200)
			.end(function(err, res) {
				res.body.should.have.lengthOf(5);
				done();
			});
    	});
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

		it('should not delete any articles.', function(done) {
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

	describe('POST /image #saveImage()', function() {
		after(function(done) {
			helper.removePictures(done);
		});

		beforeEach(function(done) {
			helper.prepareImages(done);
		});

		it('should save image and return success.', function(done) {
			request(app)
			.post('/image')
			.set('cookie', cookie)
			.attach('file', __dirname + '/test1.jpeg')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);

				res.body.success.should.be.true;
				res.body.image.url.should.be.startWith('img');

				done();
			});
		});

		it('should not success.', function(done) {
			request(app)
			.post('/image')
			.set('cookie', cookie)
			.attach('file', __dirname + '/test1.notjpeg')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);

				res.body.success.should.be.false;

				done();
			});
		});
	});

	describe('GET /article #getArticle()', function() {
		it('should return the selected article.', function(done) {
			var n = 2;

			request(app)
			.get('/article')
			.set('cookie', cookie)
			.query({alias: articles[n].alias})
			.expect(200)
			.end(function(err, res) {
				res.body._id.should.be.eql(String(articles[n]._id));
				res.body.title.should.be.eql(articles[n].title);
				res.body.alias.should.be.eql(articles[n].alias);
				res.body.tags.join().should.be.eql(articles[n].tags.join());
				new Date(res.body.createDate).should.be.eql(articles[n].createDate);
				new Date(res.body.modifyDate).should.be.eql(articles[n].modifyDate);
				res.body.hidden.should.be.eql(articles[n].hidden);
				res.body.mdContent.should.be.eql(articles[n].mdContent);
				res.body.htmlContent.should.be.eql(articles[n].htmlContent);
				res.body.hits.should.be.eql(articles[n].hits);
				res.body.metaKeywords.should.be.eql(articles[n].metaKeywords);
				res.body.metaDescription.should.be.eql(articles[n].metaDescription);
				res.body.imageIds.join().should.be.eql(articles[n].imageIds.join());

				done();
			});
		});
	});
	
	describe('POST /article #postArticle()', function() {
		var pictures;

		beforeEach(function(done) {
			helper.insertPictures(function() {
				Picture.find({}, function(err, docs) {
					pictures = docs;
					done(err);
				});
			});
		});

		afterEach(function(done) {
			helper.removePictures(done);
		});

		it('should insert the new article, pictures and tags.', function(done) {
			var imageIds = pictures.map(function(picture) {
				return picture._id;
			});

			var data = { 
                title :             'title',
                alias :             'alias',
                tags :              ['tag1', 'tag2'],
                createDate :        new Date('2014-3-25'),
                createDate :        new Date('2014-4-5'),
                hidden :            true,
                mdContent :         '#Content',
                htmlContent :       ' ',
                hits :              0,
                metaKeywords :      'keywords',
                metaDescription :   'description',
                imageIds :          imageIds
            };

			request(app)
			.post('/article')
			.set('cookie', cookie)
			.send(data)
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);

				res.body.success.should.be.true;

				var articleId;

				async.series([
				    function(cb) {
				    	Article.findOne({alias: 'alias'}, function(err, doc) {
							if (err) return cb(err);

							doc.should.be.ok;
							articleId = doc._id;
							cb();
						});
				    },
				    function(cb) {
				    	Tag.find({}, function(err, docs) {
							if (err) return cb(err);

							docs.should.have.lengthOf(2);
							cb();
						});
				    },
				    function(cb) {
				    	Picture.findOne({name: 'picture1'}, function(err, doc) {
							if (err) return cb(err);

							doc.articleIds.join().should.eql(['id1','id2', articleId].join());
							cb();
						});
				    },
				    function(cb) {
				    	Picture.findOne({name: 'picture2'}, function(err, doc) {
							if (err) return cb(err);

							doc.articleIds.join().should.eql(['id1', articleId].join());
							cb();
						});
				    },
				    function(cb) {
				    	Picture.findOne({name: 'picture3'}, function(err, doc) {
							if (err) return cb(err);

							doc.articleIds.join().should.eql(['id2', articleId].join());
							cb();
						});
				    },
				    function(cb) {
				    	Picture.findOne({name: 'picture4'}, function(err, doc) {
							if (err) return cb(err);

							String(doc.articleIds).should.eql(String(articleId));
							cb();
						});
				    },
				    function(cb) {
				    	Picture.findOne({name: 'picture5'}, function(err, doc) {
							if (err) return cb(err);

							String(doc.articleIds).should.eql(String(articleId));
							cb();
						});
				    },
				    function(cb) {
				    	Picture.findOne({name: 'picture6'}, function(err, doc) {
							if (err) return cb(err);

							String(doc.articleIds).should.eql(String(articleId));
							cb();
						});
				    }
				], function(err, results) {
				    done(err);
				});
			});
		});
	});

	describe('PUT /article #updateArticle()', function() {
		var pictures;

		beforeEach(function(done) {
			helper.insertPictures(function() {
				Picture.find({}, function(err, docs) {
					pictures = docs;
					done(err);
				});
			});
		});

		afterEach(function(done) {
			helper.removePictures(done);
		});

		it('should update the article, save new tag and articleId in Picture', function(done) {
			articles[3].tags.push('new tag');
			articles[3].imageIds.push(String(pictures[3]._id));

			var data= {};
			for (var key in articles[3]) {
				if (articles[3].hasOwnProperty(key)) {
					data[key] = articles[3][key];
				}
			}
			data._doc._id = String(articles[3]._id);

			request(app)
			.put('/article')
			.set('cookie', cookie)
			.query(data._doc)
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);

				res.body.success.should.be.true;

				async.series([
				    function(cb) {
				    	Article.findOne({_id: articles[3]._id}, function(err, doc) {
							if (err) return cb(err);

							doc.tags.pop().should.be.eql('new tag');
							doc.imageIds.pop().should.be.eql(String(pictures[3]._id));
							cb();
						});
				    },
				    function(cb) {
				    	Tag.find({}, function(err, docs) {
							if (err) return cb(err);

							docs.map(function(doc) {
								return doc.name;
							}).should.have.containEql('new tag');
							cb();
						});
				    },
				    function(cb) {
				    	Picture.findOne({_id: pictures[3]._id}, function(err, doc) {
							if (err) return cb(err);

							doc.articleIds.pop().should.be.eql(String(articles[3]._id));
							cb();
						});
				    }
				], function(err) {
					done(err);
				});
			});
		});
	});

	describe('DELETE /article #removeArticle()', function() {
		it('should remove the article and articleId in Picture', function(done) {
			request(app)
			.del('/article')
			.set('cookie', cookie)
			.query({id: String(articles[3]._id)})
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);

				res.body.success.should.be.true;

		    	Article.findOne({_id: articles[3]._id}, function(err, doc) {
					if (err) return cb(err);

					(doc === null).should.be.true;
					done();
				});
			});
		});
	});

	describe('POST /siteinfo #saveSiteInfo()', function() {
		it('should save the site information.', function(done) {
			var data = {
				name: "Sirius sight", 
				subtitle: "EL PSY CONGROO.",
				description: "用于记录收获与感想的个人博客……", 
				footer: "Powered by Sirius.", 
				metaKeywords: "metaKeywords..", 
				metaDescription: "metaDescription.."
			};

			request(app)
			.post('/siteinfo')
			.set('cookie', cookie)
			.send(data)
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);

				res.body.success.should.be.true;
				done();
			});
		});
	});
});