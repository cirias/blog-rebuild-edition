var User = require('../models/User.js');
var bcrypt = require('bcrypt');
var helper = require('./helper');
var config = require('../config.js').config;
var async = require('async');
var mongoose = require('mongoose');

describe('User', function() {
	before(function(done){ 
        helper.connect(function(){done();}); 
    });
    after(function(done) { 
        helper.close(function(){done();}); 
    });

    var db_user = helper.getConnection().collection('users');
    var user = {};

    beforeEach(function(done) {
    	var conn = mongoose.connection;
	    // drop database 
	    conn.db.dropDatabase(function(err){
	        if(err) { 
	            return done(err); 
	        }

	        user = {
	    		username: 'user_1',
	    		password: 'password_1',
	    		loginAttempts: 0
	    	};

	    	bcrypt.genSalt(config.SALT_WORK_FACTOR, function(err, salt) {
		        if (err) return done(err);

		        // 用salt生成密码哈希值
		        bcrypt.hash(user.password, salt, function (err, hash) {
		            if (err) return done(err);

		            // 用哈希值替代用户密码
		            user.password = hash;

		            db_user.insert([user], function(err, docs) {
			            done(err);
			        });
		        });
		    });

	    });
    });

    describe('#save()', function() {
    	it('should save the user with bcrypted password.', function(done) {
    		var user = {
    			username: 'user_2',
    			password: 'password_2'
    		};

    		new User(user).save(function(err, doc) {
    			(err === null).should.be.true;
    			doc.password.should.not.eql(user.password);
    			done();
    		});
    	});

    	it('should return the ValidationError.', function(done) {
    		var user = {
    			username: 'user_2'
    		};

    		new User(user).save(function(err, doc) {
    			(err !== null).should.be.true;
    			err.name.should.be.eql('ValidationError');
    			done();
    		});
    	});
    });

    describe('#comparePassword()', function() {
    	it('should match the user.', function(done) {
    		User.findOne({username: user.username}, function(err, doc) {
    			if (err) return done(err);

    			doc.comparePassword('password_1', function(err, isMatch) {
    				(err === null).should.be.true;
    				isMatch.should.be.true;
    				done();
    			});
    		});
    	});

    	it('should not match the user.', function(done) {
    		User.findOne({username: user.username}, function(err, doc) {
    			if (err) return done(err);

    			doc.comparePassword('user.password', function(err, isMatch) {
    				(err === null).should.be.true;
    				isMatch.should.be.false;
    				done();
    			});
    		});
    	});
    });

    describe('#incLoginAttempts()', function() {
    	it('should increase loginAttempts to 1.', function(done) {
    		User.findOne({username: user.username}, function(err, doc) {
    			if (err) return done(err);

    			doc.incLoginAttempts(function(err) {
    				(err === null).should.be.true;

    				User.findOne({username: user.username}, function(err, doc) {
    					doc.loginAttempts.should.eql(1);
    					done();
    				});
    			});
    		});
    	});

    	it('should lock the user.', function(done) {
    		User.findOne({username: user.username}, function(err, doc) {
    			if (err) return done(err);

    			doc.update({$set: {loginAttempts: 4}}, function(err) {
    				if (err) return done(err);

    				User.findOne({username: user.username}, function(err, doc) {
    					if (err) return done(err);

    					doc.incLoginAttempts(function(err) {
		    				(err === null).should.be.true;

		    				User.findOne({username: user.username}, function(err, doc) {
		    					doc.lockUntil.should.be.a.Number;
		    					doc.isLocked.should.be.true;
		    					done();
		    				});
		    			});
    				});
    			});
    		});
    	});

    	it('should init loginAttempts to 1.', function(done) {
    		User.findOne({username: user.username}, function(err, doc) {
    			if (err) return done(err);

    			doc.lockUntil = Date.now();

    			doc.save(function(err, doc) {
    				if (err) return done(err);

    				doc.incLoginAttempts(function(err, doc) {
	    				(err === null).should.be.true;

	    				User.findOne({username: user.username}, function(err, doc) {
	    					doc.loginAttempts.should.eql(1);
		    				(doc.lockUntil === undefined).should.be.true;
		    				done();
	    				});
	    			});
    			});
    		});
    	});
    });

	describe('#getAuthenticated()', function() {
		it('should return NOT_FOUND.', function(done) {
			User.getAuthenticated('user', '123', function(err, user, reason) {
				(err === null).should.be.true;
				(user === null).should.be.true;
				reason.should.be.eql(User.failedLogin.NOT_FOUND);
				done();
			});
		});

		it('should return MAX_ATTEMPTS.', function(done) {
			User.findOne({username: user.username}, function(err, doc) {
    			if (err) return done(err);

    			doc.update({$set: {loginAttempts: 5, lockUntil: Date.now() + 500000}}, function(err) {
    				if (err) return done(err);

    				User.getAuthenticated(user.username, 'password_1', function(err, user, reason) {
						(err === null).should.be.true;
						(user === null).should.be.true;
						reason.should.be.eql(User.failedLogin.MAX_ATTEMPTS);
						done();
					});
    			});
    		});
		});

		it('should return the user.', function(done) {
			User.getAuthenticated(user.username, 'password_1', function(err, doc, reason) {
				(err === null).should.be.true;
				doc.username.should.be.eql(user.username);
				(reason === undefined).should.be.true;
				done();
			});
		});

		it('should return PASSWORD_INCORRECT.', function(done) {
			User.getAuthenticated(user.username, 'password', function(err, user, reason) {
				(err === null).should.be.true;
				(user === null).should.be.true;
				reason.should.be.eql(User.failedLogin.PASSWORD_INCORRECT);
				done();
			});
		});
	});
});