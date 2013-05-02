'use strict';

/**
 * Services that gets nodes from Drupal
 */
monchacos.factory( 'monchacosStorage', function( $http) {
    //var blogPath = 'http://www.monchacos.com/monchacos/rest/blog';
    //var nodePath = 'http://www.monchacos.com/monchacos/rest/node';  
    
    var blogPath = 'jsonBlog.json';
    var nodePath = 'http://www.monchacos.com/monchacos/rest/node';

    return {
        getBlog: function() {
            $http.get(blogPath).then(function(response) {
                console.log(response);
                return response.data;
            });
        },
        getNode: function(nid){
            $.get(nodePath + '/' + nid).done(function(data){
                return JSON.parse(data);
            }).fail(function(){return {};});
        } 
       
    };
});
