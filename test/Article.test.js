// require('./settings'); 
var mongoose = require('mongoose'); 
var helper = require('./helper');
var Article = require('../models/Article.js');
var marked = require('marked');

describe('Article', function() {
    before(function(done){ 
        helper.connect(function(){done();}); 
    });
    after(function(done) { 
        helper.close(function(){done();}); 
    });
    beforeEach(function(done){ 
        helper.initdb(function(){done();}); 
    });

    var db_article = helper.getConnection().collection('articles');

    describe('#save()', function() {
        it('should be created, mdContent should be covert to htmlContent', function(done) {
            var data = { 
                title :             'title',
                alias :             'alias',
                tags :              ['tag'],
                createDate :        new Date('2014-3-25'),
                createDate :        new Date('2014-4-5'),
                hidden :            true,
                mdContent :         '#Content',
                htmlContent :       ' ',
                hits :              0,
                metaKeywords :      'keywords',
                metaDescription :   'description',
                imageIds :          ['id1', 'id2']
            };

            var article = new Article(data);

            article.save(function(err) {
                (err === null).should.be.true;

                db_article.find({alias:'alias'}, function(err, cursor){ 
                    cursor.toArray(function(err,docs) { 
                        docs.should.have.lengthOf(1); 
                        var article = docs[0]; 
                        article._id.should.not.be.null;
                        for (var key in data) {
                            if (key === 'htmlContent') continue;
                            article[key].should.be.eql(data[key]);
                        }
                        article.htmlContent.should.be.equal(marked(data.mdContent));
                        done(); 
                    });
                }); 
            });
        });

    });

    describe('#update()', function() {
        it('should be updated, mdContent should be covert to htmlContent.', function(done) {
            var query = {alias: 'alias1'};
            var data = { 
                title :             'title',
                alias :             'alias',
                tags :              ['tag'],
                createDate :        new Date('2014-3-25'),
                createDate :        new Date('2014-4-5'),
                hidden :            true,
                mdContent :         '#Content1',
                htmlContent :       ' ',
                hits :              0,
                metaKeywords :      'keywords',
                metaDescription :   'description',
                imageIds :          ['id1', 'id2']
            };

            Article.findOne(query, function(err, article) {
                article.updateTo(data, function(err, article) {
                    (err === null).should.be.true;

                    db_article.find({alias:'alias'}, function(err, cursor){ 
                        cursor.toArray(function(err,docs) {
                            docs.should.have.lengthOf(1);
                            var article = docs[0];
                            article._id.should.not.be.null;
                            for (var key in data) {
                                if (key === 'htmlContent') continue;
                                article[key].should.be.eql(data[key]);
                            }
                            article.htmlContent.should.be.equal(marked(data.mdContent));
                            done(); 
                        });
                    });
                });
            });
        });

        it('should not be updated.', function(done) {
            var query = {alias: 'alias1'};

            Article.findOne(query, function(err, article) {
                article.updateTo(1234, function(err, article) {
                    (err === null).should.be.false;
                    err.name.should.be.eql('TypeError');
                    done();
                });
            });
        });

        it('should not updated the unexsiting path.', function(done) {
            var query = {alias: 'alias1'};

            Article.findOne(query, function(err, article) {
                article.updateTo({mdContent: '#Content1', hu: 123}, function(err, article) {
                    (err === null).should.be.true;

                    db_article.find(query, function(err, cursor){ 
                        cursor.toArray(function(err,docs) {
                            docs.should.have.lengthOf(1);
                            var article = docs[0];
                            article._id.should.not.be.null; 
                            article.htmlContent.should.be.equal(marked(article.mdContent));
                            (article.hu === undefined).should.be.true;
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('#getDates()', function() {
        it('should return date list.', function(done) {


            done();
        });
    });

    // describe('#selectArray()', function() {
    //     it('should return all articles', function(done) {
    //         Article.selectArray(null, null, null, Article.FIELDS.join(' '), function(err, articles) {
    //             (err === null).should.be.true;
    //             articles.should.have.lengthOf(20);
    //             done();
    //         });
    //     });

    //     var tag = 'tag1';
    //     it('should return the articles whose tags contains "'+tag+'".', function(done) {
    //         var query = {tags: tag};
    //         Article.selectArray(query, null, null, Article.FIELDS.join(' '), function(err, articles) {
    //             (err === null).should.be.true;

    //             db_article.find(query, function(err, cursor){ 
    //                 cursor.toArray(function(err,docs) {
    //                     articles.should.have.lengthOf(docs.length);
    //                 });
    //             });

    //             articles.forEach(function(article) {
    //                 article.tags.should.containEql(tag);
    //             });

    //             done();
    //         });
    //     });

    //     var start = new Date('2013-12-1');
    //     var end = new Date('2014-1-1');
    //     it('should return the articles whose "createDate" is in '+(start.getYear()+1900)+'-'+(start.getMonth()+1)+'.', function(done) {
    //         var query = {createDate: {$gte: start, $lt: end}};
    //         Article.selectArray(query, null, null, Article.FIELDS.join(' '), function(err, articles) {
    //             (err === null).should.be.true;

    //             db_article.find(query, function(err, cursor){ 
    //                 cursor.toArray(function(err,docs) {
    //                     articles.should.have.lengthOf(docs.length);
    //                 });
    //             });

    //             articles.forEach(function(article) {
    //                 article.createDate.getMonth().should.eql(start.getMonth());
    //             });

    //             done();
    //         });
    //     });
        
    //     var pageNum = 2;
    //     var count = 4;
    //     it('should return the page No.'+pageNum+'\'s '+count+' article.', function(done) {
    //         Article.selectArray(null, pageNum, count, Article.FIELDS.join(' '), function(err, articles) {
    //             (err === null).should.be.true;

    //             db_article.find({}).sort({createDate: '-1'}).skip((pageNum - 1) * count).limit(count);

    //             // articles.forEach(function(article) {
    //             //     article.createDate.getMonth().should.eql(start.getMonth());
    //             // });

    //             done();
    //         });
    //     });
    // });
});