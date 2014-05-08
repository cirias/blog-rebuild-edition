var mongoose = require('mongoose'); 
var helper = require('./helper');
var Tag = require('../models/Tag.js');
var marked = require('marked');
var async = require('async');

describe('Tag', function() {
    before(function(done) { 
        helper.connect(function() {
            helper.initdb(function() {
                done();
            });
        });
    });
    after(function(done) { 
        helper.close(done); 
    });
    beforeEach(function(done){ 
        helper.insertTags(done); 
    });
    afterEach(function(done) {
        helper.removeTags(done);
    });

    var db_tag = helper.getConnection().collection('tags');

    describe('#saveNews()', function() {
	    it('should save the new tags', function(done) {
	    	Tag.saveNews(['tag1', 'tag2', 'tag10'], function(err) {
	    		db_tag.find({}, function(err, cursor){ 
                    cursor.toArray(function(err, docs) {
                        docs.should.have.lengthOf(11);
                        docs.map(function(doc) {return doc.name;}).should.be.containEql('tag10');
                        done();
                    });
                });
	    	});
	    });

	    it('should not save any tags', function(done) {
	    	Tag.saveNews(['tag1', 'tag2', 'tag1'], function(err) {
	    		db_tag.find({}, function(err, cursor){ 
                    cursor.toArray(function(err, docs) {
                        docs.should.have.lengthOf(10);
                        done();
                    });
                });
	    	});
	    });

	    it('should return an TypeError', function(done) {
	    	Tag.saveNews('123', function(err) {
	    		(err !== null).should.be.true;
                err.name.should.be.eql('TypeError');
                done();
	    	});
	    });

	    it('should return an TypeError', function(done) {
	    	Tag.saveNews(123, function(err) {
	    		(err !== null).should.be.true;
                err.name.should.be.eql('TypeError');
                done();
	    	});
	    });

    });

	describe('#selectAll()', function() {
		beforeEach(function(done) {
            Tag.status.setNotFresh();
            done();
        });

        it('should return all tags', function(done) {
        	Tag.selectAll(Tag.status, function(err, results) {
				(err === null).should.be.true;

				db_tag.find({}, function(err, cursor){ 
                    cursor.toArray(function(err, docs) {
                        results.should.have.lengthOf(docs.length);
                        done();
                    });
                });
			});
        });

        it('should change Tag.status to false', function(done) {
        	Tag.selectAll(Tag.status, function(err, results) {
				(err === null).should.be.true;
				Tag.status.getFresh().should.be.true;
				done();
			});
        });

        it('should not access TagDB.', function(done) {
        	Tag.selectAll(Tag.status, function(err, results) {				
				db_tag.insert(['tag11'], function(err, docs) {
					db_tag.find({}, function(err, cursor){ 
	                    cursor.toArray(function(err, docs) {
	                        Tag.selectAll(Tag.status, function(err, results) {
				            	results.should.have.lengthOf(docs.length-1);
				            	done();
				            });
	                    });
	                });
		        }); 
			});
        });
	});
});