'use strict';

/* Controllers */

angular.module('app.controllers', [])
  .controller('ArticleCtrl', ['$scope', '$routeParams', '$rootScope', '$sce', 'Article', 'Tag', 'siteInfo', function($scope, $routeParams, $rootScope, $sce, Article, Tag, siteInfo) {
    $scope.init = function() {
      $rootScope.siteInfo = siteInfo;
      $rootScope.tags = Tag.query();
      
      $scope.article = Article.get({alias: $routeParams.alias}, function() {
        $rootScope.siteInfo.metaKeywords = $scope.article.metaKeywords;
        $rootScope.siteInfo.metaDescription = $scope.article.metaDescription;

        $scope.article.safeHtml = $sce.trustAsHtml($scope.article.htmlContent);
      });
    };

  }])
  .controller('ArticlesCtrl', ['$scope', '$sce', '$location', '$routeParams', '$rootScope', 'Paths', 'articleConfig', 'siteInfo', 'Articles', 'Tag', 'Dates', function($scope, $sce, $location, $routeParams, $rootScope, Paths, articleConfig, siteInfo, Articles, Tag, Dates) {
    var params = null;

    $scope.init = function() {
      $rootScope.siteInfo = siteInfo;
      $rootScope.tags = Tag.query();
      $rootScope.dates = Dates.query();

      var query = null;
      var path = $location.path();
    
      switch (true) {
        case Paths.ALL.test(path):
          query = {};
          break;
        case Paths.BY_TAG.test(path):
          query = {tags: $routeParams.tag};
          break;
        case Paths.BY_DATE.test(path):
          var start = new Date($routeParams.year, $routeParams.month - 1, 1);
          var end = new Date($routeParams.year, $routeParams.month, 1);
          query = {
            createDate: {$gte: start, $lt: end}
          };
          break;
      }

      params = {
        query: JSON.stringify(query),
        pageNum: $routeParams.pageNum || 1,
        count: $routeParams.count || articleConfig.defaultCount
      };

      $scope.articles = Articles.query(params);
    };

    $scope.incArticles = function() {
      params.pageNum = params.pageNum + 1;
      Articles.query(params, function(newArticles) {
        newArticles.forEach(function(article) {
          $scope.articles.push(article);
        });
      });
    };

  }])
  .controller('ArticleEntryCtrl', ['$scope', '$sce', function($scope, $sce) {
    $scope.article.safeHtml = $sce.trustAsHtml($scope.article.htmlContent);
  }])
  .controller('TagArticlesCtrl', ['$scope', '$routeParams', 'Articles', function($scope, $routeParams, Articles) {
    $scope.init = function() {
      $scope.articles = Articles.query({
        query: {tag: $routeParams.tag},
        pageNum: $routeParams.pageNum || 1,
        count: $routeParams.count || articleConfig.defaultCount
      });
    }

  }])
  .controller('DateArticlesCtrl', ['$scope', '$routeParams', 'Articles', function($scope, $routeParams, Articles) {
    $scope.init = function() {
      $scope.articles = Articles.query({
        query: {year: $routeParams.year, month: $routeParams.month},
        pageNum: $routeParams.pageNum || 1,
        count: $routeParams.count || articleConfig.defaultCount
      });
    }

  }]);
