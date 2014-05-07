var mongoose = require('mongoose'); 
var helper = require('./helper');
var Picture = require('../models/Picture.js');
var marked = require('marked');
var async = require('async');
var fs = require('fs');
var config = require('../config.js').config;

describe('Picture', function() {
    before(function(done){ 
        helper.connect(function(){done();}); 
    });
    after(function(done) { 
        helper.close(function(){done();}); 
    });
    beforeEach(function(done){ 
        helper.initdbPicture(function(){done();}); 
    });
    afterEach(function(done){ 
        helper.afterPicture(function(){done();}); 
    });

    var db_picture = helper.getConnection().collection('pictures');

    describe('#remove()', function() {
	    it('should remove the picture.', function(done) {
	    	Picture.findOne({}, function(err, picture) {
                picture.remove(function(err, picture) {
                    fs.existsSync(picture.path).should.be.false;
                    done();
                });
            });
	    });
    });

    describe('#insertAndSave()', function() {
        it('should insert an entry in db and save the file to public folder.', function(done) {
            Picture.insertAndSave({
                name: 'test_temp',
                type: 'jpeg',
                originPath: config.MULTIPARTY_OPTIONS.uploadDir + '/test_temp.jpeg'
            }, function(err, picture) {
                (err === null).should.be.true;

                db_picture.find({name: 'test_temp'}, function(err, cursor){ 
                    cursor.toArray(function(err,docs) {
                        docs[0].path.should.be.ok;
                        docs[0].url.should.be.ok;
                        picture.path.should.be.eql(docs[0].path);
                        fs.existsSync(picture.path).should.be.true;
                        done();
                    });
                });
            });
        });

        it('should not insert into db and return a TypeError.', function(done) {
            Picture.insertAndSave({
                name: 'test_temp',
                type: 'jpeg'
            }, function(err, picture) {
                (err !== null).should.be.true;

                db_picture.find({name: 'test_temp'}, function(err, cursor){
                    cursor.toArray(function(err,docs) {
                        docs.should.be.empty;
                        done();
                    });
                });
            });
        });
    })

    describe('#updateByArticleIds()', function() {
        it('should add "id2" to "picture2"\'s "articleIds".', function(done) {
            db_picture.find({}, function(err, cursor){
                cursor.toArray(function(err,docs) {
                    var ids = [];
                    docs.forEach(function(doc) {
                        ids.push(doc._id);
                    });

                    Picture.updateByArticleIds(ids, 'id2', function(err) {
                        (err === null).should.be.true;

                        db_picture.find({name: 'picture2'}, function(err, cursor){
                            cursor.toArray(function(err,docs) {
                                docs[0].articleIds.should.be.eql(['id1','id2']);
                                done();
                            })
                        });
                    });
                });
            });
        });

        it('should return a TypeError.', function(done) {
            db_picture.find({}, function(err, cursor){
                cursor.toArray(function(err,docs) {
                    var ids = [];
                    docs.forEach(function(doc) {
                        ids.push(doc._id);
                    });

                    Picture.updateByArticleIds(ids[0], 'id2', function(err) {
                        (err !== null).should.be.true;
                        err.name.should.be.eql('TypeError');
                        done();
                    });
                });
            });
        });
    });

    describe('#removeByArticleIds()', function() {
        it('should remove "id2" in "articleIds" field. And remove picture3.', function(done) {
            db_picture.find({}, function(err, cursor){
                cursor.toArray(function(err,docs) {
                    var ids = [];
                    docs.forEach(function(doc) {
                        ids.push(doc._id);
                    });

                    Picture.removeByArticleIds(ids, 'id2', function(err) {
                        (err === null).should.be.true;

                        db_picture.find({}, function(err, cursor){
                            cursor.toArray(function(err,docs) {
                                docs.should.have.lengthOf(2);
                                docs[0].articleIds.should.be.eql(['id1']);
                                docs[1].articleIds.should.be.eql(['id1']);
                                done();
                            });
                        });
                    });
                });
            });
        });

        it('should return a TypeError.', function(done) {
            db_picture.find({}, function(err, cursor){
                cursor.toArray(function(err,docs) {
                    var ids = [];
                    docs.forEach(function(doc) {
                        ids.push(doc._id);
                    });

                    Picture.removeByArticleIds(ids[0], 'id2', function(err) {
                        (err !== null).should.be.true;
                        err.name.should.be.eql('TypeError');
                        done();
                    });
                });
            });
        });
    });
});