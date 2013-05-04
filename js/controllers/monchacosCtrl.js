'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves the model via a Service
 * - exposes the model to the template and provides event handlers
 * The controllers are not Models, they just link the data in the model and expose it to the View
 * { Tip of the day !} - Controllers should be "Write only", while views should be "Read Only"
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
    
    // Watch directives are fired many times. You can use them to execute FAST pieces of code that evaluates some changes on the element.
    // Dont use SLOW pieces of code in a wath sentence (or counters) as they may slow your  site.
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