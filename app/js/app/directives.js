'use strict';

/* Directives */


angular.module('app.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).
  // 网页元数据加载器
  directive('metaTagDescription', [function() {
    return {
    	scope: '=',
    	template: '<meta name="description" content="{{siteInfo.metaDescription}}">',
      replace: true
    };
  }]).
  directive('metaTagKeywords', [function() {
    return {
      scope: '=',
      template: '<meta name="keywords" content="{{siteInfo.metaKeywords}}">',
      replace: true
    };
  }]);
