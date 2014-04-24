//i change this comment to check if the 'git pull' works.

exports.config = {
	SESSION_SECRET : 'Secret of my site session.',
	PUBLIC_KEY  : '6Lc7LPESAAAAAAII8Q419IuYbiVLWChDdgF09eWh',
    PRIVATE_KEY : '6Lc7LPESAAAAAFXQemWzWmyTkuQo56WFIMowANq3',
    DB_CONNECTION : 'mongodb://localhost/blog',
    ARTICLE_INFO_FIELDS : 'title createDate hidden hits alias'
};//

exports.message = {
	INSERT_SUCCESS:	'New Article Success.',
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
	MISSING_BODY:	'One or more required entrys dose not given.'
};