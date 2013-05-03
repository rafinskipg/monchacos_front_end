'use strict';

/**
 * Services that gets nodes from Drupal
 * See the Angular JS Docs http://docs.angularjs.org/guide/dev_guide.services.creating_services
 */
monchacos.factory( 'monchacosStorage', function($http, $q) {
    var blogPath = 'http://www.monchacos.com/monchacos/rest/blog';
    var nodePath = 'http://www.monchacos.com/monchacos/rest/node';  
    
    //var blogPath = 'jsonBlog.json';
    //var nodePath = 'jsonNode.json';

    return {
        getBlog: function() {
            //Some documentation about angular JS promises http://docs.angularjs.org/api/ng.$q
            var deferred = $q.defer();
            //Some documentation over http and success fail callbacks http://docs.angularjs.org/api/ng.$http
            $http.get(blogPath).then(function(response) {
                 deferred.resolve(response.data);
            },function(response){ deferred.reject([]);});
            return deferred.promise;
        },
        getNode: function(nid){
            var deferred = $q.defer();
            //Some documentation over http and success fail callbacks http://docs.angularjs.org/api/ng.$http
            $http.get(nodePath+'/'+nid).then(function(response) {
                 deferred.resolve(response.data);
            },function(response){ deferred.reject([]);});
            return deferred.promise;
        } 
       
    };
});
