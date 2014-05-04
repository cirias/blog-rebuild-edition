'use strict';

// 与服务端交互的数据资源对象
angular.module('myApp.models', [])
	.factory('Articles', ['$resource', 'BackendUrl', function($resource, BackendUrl) {
		return $resource(BackendUrl + '/articles', null, {
			'query': 	{ method: 'GET', isArray: true },
			'update': 	{ method: 'PUT' },
			'remove':	{ method: 'DELETE' }
		});
	}])
	.factory('Tag', ['$resource', 'BackendUrl', function($resource, BackendUrl) {
		return $resource(BackendUrl + '/tags', null, {
			'query':	{ method: 'GET', isArray: true }
		});
	}])
	.factory('Article', ['$resource', 'BackendUrl', function($resource, BackendUrl) {
		return $resource(BackendUrl + '/article', null, {
			'save': 	{ method: 'POST' },
			'update':	{ method: 'PUT' }, 
			'get': 		{ method: 'GET' },
			'remove':	{ method: 'DELETE' }
		});
	}])
	.factory('SiteInfo', ['$resource', 'BackendUrl', function($resource, BackendUrl) {
		return $resource(BackendUrl + '/siteInfo', null, {
			'save': 	{ method: 'POST' }
		});
	}]);