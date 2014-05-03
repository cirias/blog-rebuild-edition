'use strict';

/* Directives */


angular.module('app.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).
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
  // directive('scroll', ['$window', function($window) {
  //   return {
  //     restrict: 'A',
  //     scope: '=',
  //     link: function(scope, elm, attrs) {
  //       angular.element($window).bind("scroll", function() {
  //         if (Math.abs(elm.context.scrollHeight-this.pageYOffset) <= 100) {
  //           // console.log($window);
  //           scope.incArticles();
  //           scope.$apply();
  //         }
  //       });
  //     }
  //   };
  // }]);
  // pageYOffset: 2529
  // scrollHeight: 2462
