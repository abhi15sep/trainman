'use strict';

module.exports = function( config ) {
  return {
    redirectToHTTPS: function( request, response, next ) {
      var protocol = request.headers[ 'x-forwarded-proto' ] || request.protocol;

      var requireHTTPS = config.secure === true ||
                         (
                           Array.isArray( config.secure ) &&
                           config.secure.indexOf( request.hostname )
                         );

      if ( requireHTTPS && protocol !== 'https' ) {
        return response.redirect( 'https://' + request.hostname + request.url );
      }

      next();
    }
  }
};
