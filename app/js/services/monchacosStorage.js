'use strict';

/**
 * Services that gets nodes from Drupal
 * Services are the place where you can create code that has to be used in many controllers. 
 * { Tip of the day !} - Also is the place to use data that has to be shared between controllers. 
 * See the Angular JS Docs http://docs.angularjs.org/guide/dev_guide.services.creating_services
 */
monchacos.factory( 'monchacosStorage', function($http, $q) {
    /*var blogPath = 'http://www.monchacos.com/monchacos/rest/blog';
    var nodePath = 'http://www.monchacos.com/monchacos/rest/node';  
    
    blogPath= window.location.href.indexOf('www') != -1? blogPath : blogPath.replace('www.','');
    nodePath= window.location.href.indexOf('www')  != -1? nodePath : nodePath.replace('www.','');*/
    
    var blogPath = 'jsonBlog.json';
    var nodePath = 'jsonNode.json';

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
            var path = (nodePath.indexOf('monchacos') != -1) ? nodePath +'/'+nid: nodePath;
            //Some documentation over http and success fail callbacks http://docs.angularjs.org/api/ng.$http
            
            $http.get(path).then(function(response) {
                 deferred.resolve(response.data);
            },function(response){ deferred.reject([]);});
            return deferred.promise;
        } 
       
    };
});
