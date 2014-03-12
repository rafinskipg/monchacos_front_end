'use strict';

/**
 * The main Monchacos app module.
 * See more documentation on "Thinking the Angular Way" http://stackoverflow.com/questions/14994391/how-do-i-think-in-angularjs-if-i-have-a-jquery-background
 * See more documentation on Angular JS for big apps http://briantford.com/blog/huuuuuge-angular-apps.html
 * @type {angular.Module}
 */
//See more documentatioin on Angular JS route http://docs.angularjs.org/api/ng.$route
var monchacos = angular.module('monchacos', [], function($routeProvider, $locationProvider) {
    //Now its not needed but in a future i want to introduce new paths
    $routeProvider.when('/blog', {
        templateUrl: 'templates/blog.html',
        controller: blogCtrl
    });
    $routeProvider.when('/article/:nid', {
        templateUrl: 'templates/article.html',
        controller: articleCtrl
    });
    $routeProvider.when('/news', {
        templateUrl: 'templates/news.html',
        controller: newsCtrl
    });
    $routeProvider.when('/', {
        templateUrl: 'templates/blog.html',
        controller: blogCtrl
    });
    $routeProvider.when('/team', {
        templateUrl: 'templates/team.html',
        controller: teamCtrl
    });
    $routeProvider.when('/list', {
        templateUrl: 'templates/list.html',
        controller: listCtrl
    });
    $routeProvider.when('/experiments', {
        templateUrl: 'templates/experiments.html',
        controller: expCtrl
    });
    $routeProvider.when('/404', {
        templateUrl: 'templates/404.html',
        controller: notFoundCtrl
    });
    // Redirect to the 404 page.
    $routeProvider.otherwise({
        redirectTo: '/404'
    });
   

 
  //configure html5 to get links working on jsfiddle
  //$locationProvider.html5Mode(true);
  // See more about html5 mode and $location at http://docs.angularjs.org/guide/dev_guide.services.$location
  // See more on locationProvider at http://docs.angularjs.org/api/ng.$locationProvider
});
