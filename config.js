//i change this comment to check if the 'git pull' works.
var path = require('path');

exports.config = {
	SESSION_SECRET : 'Secret of my site session.',
	PUBLIC_KEY  : '6Lc7LPESAAAAAAII8Q419IuYbiVLWChDdgF09eWh',
    PRIVATE_KEY : '6Lc7LPESAAAAAFXQemWzWmyTkuQo56WFIMowANq3',
    DB_CONNECTION : 'mongodb://localhost/blog',
    ARTICLE_INFO_FIELDS : 'title createDate hidden hits alias tags',
    STATIC_DIR : 'public',
    IMAGE_SUB_DIR : 'images',
    MULTIPARTY_OPTIONS : {
    	uploadDir: './temp',
    	maxFilesSize: 1024 * 1024 * 10
    } 
};//

exports.relative = {
	IMAGE_DIR : path.join(this.config.STATIC_DIR, this.config.IMAGE_SUB_DIR)
}

exports.message = {
	INSERT_SUCCESS:	'New Article Success.',
	UPDATE_SUCCESS: 'Update Article Success.', 
	REMOVE_SUCCESS:	'Remove Article Success.',
	UPLOAD_IMAGE_SUCCESS: 'Upload Image Success.',

	MISSING_ID:		'Missing ArticleId.',
	MISSING_TITLE:	'Please input a title.',
	MISSING_ALIAS:	'Please input an alias.',
	MISSING_TAGS:	'Please choose some tags.',
	MISSING_CDATE:	'Please input create date.',
	MISSING_MDATE:	'Please input modify date.',
	MISSING_HIDDEN:	'Please choose status.',
	MISSING_MCONTENT:	'Please input content.',
	MISSING_HCONTENT:	'Please input html.',
	MISSING_MKEYWORDS:	'Please input meta keywords.',
	MISSING_MDESCRIPTION:	'Please meta description.',
	MISSING_BODY:	'One or more required entrys dose not given.',

	NOT_IMAGE:		'It\'s not an image.',
	FILE_TOO_BIG:	'The file is too large.',

	WRONG_ID:		'Wrong id.'
};