'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  // 监视hidden变量，根据其值改变图标，'btnPublish'匹配属性'btn-publish'
  .directive('btnPublish', function() {
	    return {
	    	restrict: 'A',
	    	link: function(scope, elm, attrs) {
	    		scope.$watch(attrs.hidden, function(value) {
			    	if (!value) {
		    			elm.html('<span class="glyphicon glyphicon-remove-circle"></span>');
		    		} else {
		    			elm.html('<span class="glyphicon glyphicon-ok-circle"></span>');
		    		}
			    });
		    }
		};
	});
