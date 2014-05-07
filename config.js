var path = require('path');

exports.config = {
	SESSION_SECRET : 'Secret of my site session.',
	PUBLIC_KEY  : '6Lc7LPESAAAAAAII8Q419IuYbiVLWChDdgF09eWh',
    PRIVATE_KEY : '6Lc7LPESAAAAAFXQemWzWmyTkuQo56WFIMowANq3',
    DB_CONNECTION : 'mongodb://localhost/test',
    STATIC_DIR : 'app',
    IMAGE_SUB_DIR : 'img',
    MULTIPARTY_OPTIONS : {
    	uploadDir: './temp',
    	maxFilesSize: 1024 * 1024 * 10
    },
    user : {
    	MAX_LOGIN_ATTEMPTS : 5,
		LOCK_TIME : 2 * 60 * 60 * 1000
    },
    textFile : {
    	TEMPLATE_SITE_INFO_PATH : './template/services.js',
    	CLIENT_SITE_INFO_PATH : 'D:/workspace/project/blog-clientside/app/js/services.js'
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
	SITE_INFO_UPDATE_SUCCESS: 'Site Infomation Update Success.',

	MONTH_NAMES: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

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
	ALIAS_NOT_UNIQUE: 'Article\'s alias is not unique.',

	NOT_IMAGE:		'It\'s not an image.',
	FILE_TOO_BIG:	'The file is too large.',

	WRONG_ID:		'Wrong id.',

	INCORRECT_OR_NOT_FOUND:		'Password incorrect or the user not found.',
	USER_LOCKED: 				'Attempts too many times, the user has been locked.'
};