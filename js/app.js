'use strict';

/**
 * The main Monchacos app module.
 *
 * @type {angular.Module}
 */
var monchacos = angular.module('monchacos', []);

/*var monchacos = angular.module('monchacos', [], function($routeProvider, $locationProvider) {
  $routeProvider.when('/article/:nid', {
    templateUrl: 'node.html',
    controller: articleCtrl,
    resolve: {
      // I will cause a 1 second delay
      delay: function($q, $timeout) {
        var delay = $q.defer();
        $timeout(delay.resolve, 1000);
        return delay.promise;
      }
    }
  });
  $routeProvider.when('/blog', {
    templateUrl: 'blog.html',
    controller: blogCtrl
  });
 
  // configure html5 to get links working on jsfiddle
  $locationProvider.html5Mode(true);
});*/
