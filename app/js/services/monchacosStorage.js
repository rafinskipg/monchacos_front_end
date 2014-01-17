'use strict';

/**
 * Services that gets nodes from Drupal
 * Services are the place where you can create code that has to be used in many controllers. 
 * { Tip of the day !} - Also is the place to use data that has to be shared between controllers. 
 * See the Angular JS Docs http://docs.angularjs.org/guide/dev_guide.services.creating_services
 */
monchacos.factory( 'monchacosStorage', function($http, $q) {
    var blogPath = 'http://www.rvpg.me/monchacos/rest/blog';
    var nodePath = 'http://www.rvpg.me/monchacos/rest/node'; ;  
    var newsPath = 'http://www.rvpg.me/monchacos/rest/news'; ;  
    
    blogPath= window.location.href.indexOf('www') != -1? blogPath : blogPath.replace('www.','');
    nodePath= window.location.href.indexOf('www')  != -1? nodePath : nodePath.replace('www.','');
    newsPath= window.location.href.indexOf('www')  != -1? nodePath : nodePath.replace('www.','');
    
    var blogPath = 'jsonBlog.json';
    var nodePath = 'jsonNode.json';
    var newsPath = 'jsonNews.json';
    var nodes = [];
    return {
        nodes: nodes,
        getBlog: function() {
            
            var deferred = $q.defer();
            if(!nodes.length > 0){
                $http.get(blogPath).then(function(response) {
                    nodes = response.data;

                    deferred.resolve(nodes);
                },function(response){ deferred.reject([]);});
            }else{
                deferred.resolve(nodes);
            }
            
            return deferred.promise;
        },
        getNode: function(nid){
            var deferred = $q.defer();
            var path = (nodePath.indexOf('monchacos') != -1) ? nodePath +'/'+nid: nodePath;
            
            $http.get(path).then(function(response) {
                 deferred.resolve(response.data);
            },function(response){ deferred.reject([]);});
            return deferred.promise;
        } ,
        getList: function(){
            return $http.get('list.json');
        },
        getNews: function(){
            var deferred = $q.defer();
            $http.get(newsPath).then(function(response){
                deferred.resolve(response.data);
            }, function(){
                deferred.reject();
            });
            return deferred.promise;
        }

       
    };
});
