var Textfile = require('../models/Textfile.js');
var fs = require('fs');
var config = require('../config.js').config.textFile;


describe('Textfile', function() {
	var data = {};
	var origin = fs.readFileSync(config.CLIENT_SITE_INFO_PATH);

	beforeEach(function(done) {
		data = {
			name: "name test", 
		  	subtitle: "subtitle test",
		  	description: "description test", 
		  	footer: "footer test", 
		  	metaKeywords: "metaKeywords test", 
		  	metaDescription: "metaDescription test"
		};

		done();
	});

	afterEach(function(done) {
		fs.writeFileSync(config.CLIENT_SITE_INFO_PATH, origin);
		done();
	});

	describe('#update()', function() {
		it('should update data to siteInfo text file.', function(done) {
			Textfile.update(data, function(err) {
				(err === null).should.be.true;

				String(fs.readFileSync(config.CLIENT_SITE_INFO_PATH)).should.include('name: "name test"');
				done();
			});
		});

		it('should not success.', function(done) {
			Textfile.update('', function(err) {
				(err === null).should.be.true;

				String(fs.readFileSync(config.CLIENT_SITE_INFO_PATH)).should.be.eql(String(origin));
				done();
			});
		});
	});
});