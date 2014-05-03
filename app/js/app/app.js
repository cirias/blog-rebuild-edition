'use strict';


// Declare app level module which depends on filters, and services
angular.module('app', [
  'ngRoute',
  'ngResource',
  'infinite-scroll',
  'app.filters',
  'services',
  'app.directives',
  'app.controllers',
  'app.models',
  'config'
]).
config(['$routeProvider', '$locationProvider',  function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {templateUrl: './partials/articles.html', controller: 'ArticlesCtrl'});
  $routeProvider.when('/article/:alias', {templateUrl: './partials/article.html', controller: 'ArticleCtrl'});
  $routeProvider.when('/tag/:tag', {templateUrl: './partials/articles.html', controller: 'ArticlesCtrl'});
  $routeProvider.when('/year/:year/month/:month', {templateUrl: './partials/articles.html', controller: 'ArticlesCtrl'});
  // $routeProvider.when('/', {templateUrl: '../app/partials/articles.html', controller: 'ArticlesCtrl'});
  // $routeProvider.when('/pagenum/:pageNum/count/:count', {templateUrl: '../app/partials/articles.html', controller: 'ArticlesCtrl'});
  // $routeProvider.when('/tag/:tag/pagenum/:pageNum/count/:count', {templateUrl: '../app/partials/articles.html', controller: 'TagArticlesCtrl'});
  // $routeProvider.when('/year/:year/month/:month/pagenum/:pageNum/count/:count', {templateUrl: '../app/partials/articles.html', controller: 'DateArticlesCtrl'});
  $routeProvider.otherwise({redirectTo: '/'});
  // $locationProvider.html5Mode(true);
}]);
