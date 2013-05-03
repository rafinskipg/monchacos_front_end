'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persist the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
 function blogCtrl( $scope, $location, monchacosStorage, filterFilter, $http ) {
    var articles = $scope.articles = [];

    //Asyncronous call to a service. Using Angular JS promises
    var promise = monchacosStorage.getBlog();
    promise.then(function(data) {
      $scope.articles = data;
    }, function(reason) {
      $scope.articles = data;
    });
    
    $scope.$watch('articles', function() {});

    $scope.opened = false;
    
    $scope.readArticle = function( article ) {
        //$scope.articleReaded = article;
        $scope.opened = true;
        var promise = monchacosStorage.getNode(article.nid);
            promise.then(function(data) {
            
            data.body = data.body.und[0].safe_value;
            $scope.node = data;
            
        }, function(reason) {
            $scope.node = null;
        });
    };

    $scope.closeArticle = function(){
        $scope.opened = false;
        if($scope.node){
            $scope.node = null;
        }
    }

}


/**
 * The controller for the article detail 
 * 
 **/
 function articleCtrl(){
 
 }