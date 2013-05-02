'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persist the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
monchacos.controller( 'blogCtrl', function blogCtrl( $scope, $location, monchacosStorage, filterFilter, $http ) {
    var articles = $scope.articles = [];
    
    var blogPath = 'jsonBlog.json';
    $http.get(blogPath).then(function(response) {
                $scope.articles = response.data;
            });
   
    

    $scope.$watch('articles', function() {});


  if ( $location.path() === '' ) $location.path('/');
  $scope.location = $location;

  $scope.$watch( 'location.path()', function( path ) {
    /*$scope.statusFilter = (path == '/active') ?
      { completed: false } : (path == '/completed') ?
        { completed: true } : null;*/
  });


 

  $scope.readArticle = function( article ) {
    //$scope.articleReaded = article;
  };



});
