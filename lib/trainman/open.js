'use strict';

var url = require( 'url' );

var gulp = require( 'gulp' ),
    open = require( 'open' );

module.exports = function( config ) {
  gulp.task(
    'open',
    function() {
      if ( !config.environment.root ) {
        console.log( 'environment.root is required when opening a project' );
        process.exit();
      }

      try {
        var u = url.parse( config.environment.root );
        u.protocol = u.protocol || 'http:';

        return open( u.format() );
      }
      catch( e ) {
        console.log( 'environment.root is not a valid URL' );
        process.exit();
      }
    }
  );
};
