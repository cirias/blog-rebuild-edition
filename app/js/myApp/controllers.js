'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
// 根控制器
.controller('RootCtrl', ['$scope', function($scope) {
  // 当消息到达，广播消息给消息控制器
  $scope.$on('eMessageArive', function(event, data) {
    $scope.$broadcast('eSetMessage', data);
  });
}])
  // 消息控制器
  .controller('MessageCtrl', ['$scope', function($scope) {
    // 设置消息
    $scope.$on('eSetMessage', function(event, data) {
      $scope.message = data;
    });

    // 关闭消息窗口
    $scope.closeMsg = function() {
      $scope.message = null;
    }
  }])
  // 文章管理控制器
  .controller('ArticleManagerCtrl', ['$scope', 'Articles', function($scope, Articles) {
    // 从model初始化数据
    $scope.articlelist = Articles.query();
    
    // 当checkbox改变，广播change事件给子记录
    $scope.checkboxChanged = function() {
      $scope.$broadcast('eCheckboxChanged', $scope.allChecked);
    }

    $scope.removeArticles = function() {
      var articleIds = []

      // 获取checked文章id数组
      $scope.articlelist.forEach(function(articleInfo) {
        if (articleInfo.checked) articleIds.push(articleInfo._id);
      });

      // 利用model批量删除，返回消息data
      Articles.remove({articleIds: articleIds}, function(data) {
        setMessage(data);
      });
    }

    $scope.updateArticles = function(changes) {
      var articles = []

      // 获取checked文章数组(包括id、内容)
      $scope.articlelist.forEach(function(articleInfo) {
        if (articleInfo.checked) {
          var article = {_id: articleInfo._id};
          for(var key in changes) {
            article[key] = changes[key];
          }
          articles.push(article);
        }
      });

      // 利用model批量更新，返回消息data
      Articles.update({articles: articles}, function(data) {
        setMessage(data);
      });
    }

    // 消息处理公共方法
    $scope.setMessage = function setMessage(message) {
      // 发送消息到达事件
      $scope.$emit('eMessageArive', message);

      // 刷新页文章队列
      $scope.articlelist = null;
      $scope.articlelist = Articles.query();
      $scope.allChecked = false;
    }
  }])
    // 文章记录控制器
    .controller('ArticleEntryCtrl', ['$scope', 'Article', function($scope, Article) {

      $scope.changePublishStatus = function(next) {
        // 切换发布状态
        $scope.articleInfo.hidden = !$scope.articleInfo.hidden;

        // 利用model更新文章，然后执行next
        var article = new Article($scope.articleInfo);
        article.$update(function(data) {
          next(data);
        });
      };

      // 利用model删除文章，然后执行next
      $scope.removeArticle = function(next) {
        var article = new Article($scope.articleInfo);
        article.$remove({id: article._id}, function(data) {
          next(data);
        });
      }

      // 当收监听到事件'eCheckboxChanged'，设置checked属性
      $scope.$on('eCheckboxChanged', function(event, data) {
        $scope.articleInfo.checked = data;
      });
    }])
  // 新建文章控制器
  .controller('NewArticleCtrl', ['$scope', '$upload', 'Tag', 'Article', 'BackendUrl', function($scope, $upload, Tag, Article, BackendUrl) {
    // 初始化article、tags数据对象
    $scope.init = function() {
      $scope.tags = Tag.query();
      $scope.article = {};
      $scope.article.imageIds = [];
      $scope.article.tags = [];
      $scope.article.htmlContent = ' ';
      $scope.article.createDate = new Date().toDateInputValue();
      $scope.article.modifyDate = new Date().toDateInputValue();
    }
    
    // 保存文章
    $scope.next = function(article) {
      var article = new Article($scope.article);
      article.$save(function(data) {
        $scope.$emit('eMessageArive', data);

        // 若成功则重新初始化数据
        if (data.success) {
          $scope.init();
        }
      });
    };
  }])
  // 编辑文章控制器
  .controller('EditArticleCtrl', ['$scope', '$routeParams', 'Tag', 'Article', function($scope, $routeParams, Tag, Article) {
    // 初始化article、tags数据对象
    $scope.article = Article.get({alias: $routeParams.alias}, function() {
      Tag.query(function(tags) {
        $scope.tags = tags;
        $scope.tags.map(function(tag) {
          tag.checked = false;
          return tag;
        }).filter(function(tag) {
          return $scope.article.tags.indexOf(tag.name) >= 0;
        }).forEach(function(tag) {
          tag.checked = true;
        });
      });

      $scope.article.createDate = $scope.article.createDate.toDateFormat('yyyy-MM-dd');
      $scope.article.modifyDate = $scope.article.modifyDate.toDateFormat('yyyy-MM-dd');

      $scope.article.htmlContent = $scope.article.htmlContent || ' ';
      $scope.article.imageIds = $scope.article.imageIds || [];
    });

    // 更新文章
    $scope.next = function(article) {
      var article = new Article($scope.article);
      article.$update(function(data) {
        $scope.$emit('eMessageArive', data);
      });
    };
  }])
    // 文章编辑器控制器
    .controller('ArticleEditorCtrl', ['$scope', '$upload', 'Tag', 'Article', 'BackendUrl', function($scope, $upload, Tag, Article, BackendUrl) {
      $scope.addTag = function() {
        if ($scope.tags.indexOf($scope.newTag) < 0){
          $scope.tags.push({name:$scope.newTag, checked: true});
          $scope.article.tags.push($scope.newTag);
          $scope.newTag = '';
        }
      };

      // 当监听到事件'TagChanged'，增减article.tags
      $scope.$on('TagChanged', function(event, tag) {
        if (tag.checked) $scope.article.tags.push(tag.name);
        else $scope.article.tags.splice($scope.article.tags.indexOf(tag.name),1);
      });

      // 打开文件选择窗口
      $scope.openFileForm = function() {
        $('file').click();
      }

      // 上传文件
      $scope.onFileSelect = function($files) {
        var file = $files[0];
        $scope.upload = $upload.upload({
          url: BackendUrl + '/image',
          method: 'POST',
          file: file
        }).success(function(data) {
          // 设置消息内容
          if (data.success) {
            data.otherMsg = BackendUrl + '/' +data.image.url;
            $scope.article.imageIds.push(data.image._id);
            window.prompt("Copy to clipboard: Ctrl+C, Enter", data.otherMsg);
          }

          // 发送消息
          $scope.$emit('eMessageArive', data);
        });
      }

      // 保存文章接口
      $scope.saveArticle = function(next) {
        if (!$scope.articleForm.$valid) return;

        next($scope.article);
      };
    }])
      // 标签控制器
      .controller('TagCtrl', ['$scope', function($scope) {
        $scope.change = function() {
          $scope.$emit('TagChanged', $scope.tag);
        }
      }])
  // 全局设置控制器
  .controller('GlobalConfigurationCtrl', ['$scope', 'SiteInfo', 'siteInfo', function($scope, SiteInfo, siteInfo) {
    // 初始化数据
    $scope.siteInfo = siteInfo;

    $scope.save = function() {
      var newSiteInfo = new SiteInfo($scope.siteInfo);
      newSiteInfo.$save(function(data) {
        $scope.$emit('eMessageArive', data);
      });
    }
  }]);
