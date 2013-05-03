'use strict';

/**
 * Directive that adds a class active when path matches
 */
monchacos.directive( 'whenActive', function ( $location ) {

  return {
    scope: true,
    link: function ( scope, element, attrs ) {
      scope.$on( '$routeChangeSuccess', function () {
     
        if ( '#'+ $location.path() == element.attr( 'href' ) ) {
          element.addClass( 'active' );
        } else {
          element.removeClass( 'active' );
        }
      });
    }
  };
});

monchacos.directive('compileHtml', function($compile) {
    return {

        restrict: 'A',
        scope: {
            compileHtml: '='
        },
        replace: true,

        link: function(scope, element, attrs) {

            scope.$watch('compileHtml', function(value) {
            
                element.html($compile(value)(scope.$parent));
            });
        }
    }
});