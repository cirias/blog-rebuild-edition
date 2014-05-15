'use strict';

/* Controllers */

angular.module('app.controllers', [])
  // 单篇文章的画面控制器
  .controller('ArticleCtrl', ['$scope', '$routeParams', '$rootScope', '$sce', 'Article', 'Tag', 'siteInfo', function($scope, $routeParams, $rootScope, $sce, Article, Tag, siteInfo) {
    $scope.init = function() {
      $rootScope.siteInfo = siteInfo;
      $rootScope.tags = Tag.query();
      
      $scope.article = Article.get({alias: $routeParams.alias}, function() {
        $rootScope.siteInfo.metaKeywords = $scope.article.metaKeywords;
        $rootScope.siteInfo.metaDescription = $scope.article.metaDescription;

        // 授信htmlContent
        $scope.article.safeHtml = $sce.trustAsHtml($scope.article.htmlContent);
      });
    };

  }])
  // 多篇文章的画面控制器
  .controller('ArticlesCtrl', ['$scope', '$sce', '$location', '$routeParams', '$rootScope', 'Paths', 'articleConfig', 'siteInfo', 'Articles', 'Tag', 'Dates', 'Count', function($scope, $sce, $location, $routeParams, $rootScope, Paths, articleConfig, siteInfo, Articles, Tag, Dates, Count) {
    var params = null;    // 文章查询参数

    // 初始化数据
    $scope.init = function() {
      // 初始化基本数据到根作用域
      $rootScope.siteInfo = siteInfo;
      $rootScope.tags = Tag.query();
      $rootScope.dates = Dates.query();
      $scope.count = 1;
      Count.get(function(data) {
        $scope.count = data.count;
      });

      var query = null;   // 查询语句
      var path = $location.path();    // 当前相对url
    
      // 匹配不同的路由正则表达式，设置查询
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

          // 查询符合 start <= createDate < end 
          query = {
            createDate: {$gte: start, $lt: end}
          };
          break;
      }

      // 组装参数
      params = {
        query: JSON.stringify(query),
        pageNum: $routeParams.pageNum || 1,
        count: $routeParams.count || articleConfig.defaultCount
      };

      // 获取文章
      $scope.articles = Articles.query(params);
    };

    // 加载文章
    $scope.incArticles = function() {
      if (params.pageNum >= $scope.count) return;
      
      params.pageNum = params.pageNum + 1;
      Articles.query(params, function(newArticles) {
        newArticles.forEach(function(article) {
          $scope.articles.push(article);
        });
      });
    };

  }])
  .controller('ArticleEntryCtrl', ['$scope', '$sce', function($scope, $sce) {
    // 授信htmlContent
    $scope.article.safeHtml = $sce.trustAsHtml($scope.article.htmlContent);
  }]);
