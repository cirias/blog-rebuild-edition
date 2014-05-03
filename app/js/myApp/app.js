'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'ngResource',
  'angularFileUpload',
  'myApp.filters',
  'services',
  'myApp.directives',
  'myApp.controllers',
  'myApp.models',
  'config'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/articleManager', {templateUrl: './partials/articleManager.html', controller: 'ArticleManagerCtrl'});
  $routeProvider.when('/newArticle', {templateUrl: './partials/newArticle.html', controller: 'NewArticleCtrl'});
  $routeProvider.when('/globalConfiguration', {templateUrl: './partials/globalConfiguration.html', controller: 'GlobalConfigurationCtrl'});
  $routeProvider.when('/editArticle/:alias', {templateUrl: './partials/newArticle.html', controller: 'EditArticleCtrl'});
  $routeProvider.otherwise({redirectTo: '/articleManager'});
  // $locationProvider.html5Mode(true);
}]);
