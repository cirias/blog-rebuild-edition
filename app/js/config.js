'use strict';

angular.module('config', [])
	// 后端地址
	.value('BackendUrl', 'http://localhost:3000')
	// 路由正则表达式
	.value('Paths', {
		ALL: /^\/$/,
		BY_TAG: /^\/tag\/[^\/\s]*$/,
		BY_DATE: /^\/year\/20\d{2}\/month\/(0?[1-9]|1[0-2])$/
	});