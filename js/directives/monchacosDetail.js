'use strict';

/**
 * Directive that adds a class active when path matches
 */
monchacos.directive( 'detailNode', function ( $scope ) {

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