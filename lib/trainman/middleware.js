'use strict';

module.exports = function( config ) {
  return {
    redirectToHTTPS: function( request, response, next ) {
      var protocol = request.headers[ 'x-forwarded-proto' ] || request.protocol;

      if ( config.secure && protocol !== 'https' ) {
        return response.redirect( 'https://' + request.hostname + request.url );
      }

      next();
    }
  }
};
