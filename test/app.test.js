var request = require('supertest');
var app = require('../app.js');
var helper = require('./helper');

describe('blog app', function() {
	it('GET / should show the main page', function(done) {
		request(app)
		.get('/')
		.expect(200)
		.end(function(err, res) {
			var body = res.text;
			body.should.include('<title ng-bind-template="{{ siteInfo.name }}"></title>');
			done(err);
		});
	});
	after(function(done) { 
        helper.close(function(){done();}); 
    });
});