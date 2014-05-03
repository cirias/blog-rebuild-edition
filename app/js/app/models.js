'use strict';

angular.module('app.models', [])
	.factory('Articles', ['$resource', 'BackendUrl', function($resource, BackendUrl) {
		return $resource(BackendUrl + '/com/articles', null, {
			'query': 	{ method: 'GET', isArray: true }
		});
	}])
	.factory('Tag', ['$resource', 'BackendUrl', function($resource, BackendUrl) {
		return $resource(BackendUrl + '/tags', null, {
			'query':	{ method: 'GET', isArray: true }
		});
	}])
	.factory('Article', ['$resource', 'BackendUrl', function($resource, BackendUrl) {
		return $resource(BackendUrl + '/com/article', null, {
			'get': 		{ method: 'GET' }
		});
	}])
	.factory('Dates', ['$resource', 'BackendUrl', function($resource, BackendUrl) {
		return $resource(BackendUrl + '/dates', null, {
			'query':	{ method: 'GET', isArray: true }
		});
	}]);