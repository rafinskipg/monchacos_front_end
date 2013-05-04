'use strict';

/**
 * Directive that adds a class active when path matches
 * Directives are used to extend the HTML language creating custom elements that can be reused anywhere on the project.
 * See more info at: http://docs.angularjs.org/guide/directive
 * Look at the examples provided by todoMVC project for more information. 
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
