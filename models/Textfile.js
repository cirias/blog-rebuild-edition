var fs = require('fs');
var config = require('../config.js').config.textFile;

var siteInfo = fs.readFileSync(config.TEMPLATE_SITE_INFO_PATH);

var TextfileDAO = function(){};
module.exports = new TextfileDAO();

TextfileDAO.prototype.update = function(data, callback) {
	var newSiteInfo = String(siteInfo);

	for (var key in data) {
		newSiteInfo = newSiteInfo.replace('"'+key+'"', '"'+data[key]+'"');
	}
	
	fs.writeFile(config.CLIENT_SITE_INFO_PATH, newSiteInfo, callback);
};