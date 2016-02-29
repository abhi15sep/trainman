'use strict';

var url = require( 'url' ),
    open = require( 'open' );

module.exports = function( plugins, config ) {
  plugins.gulp.task(
    'open',
    function( callback ) {
      if ( !config.environment.root ) {
        console.log( 'environment.root is required when opening a project' );
        process.exit();
      }

      try {
        var u = url.parse( config.environment.root );
        u.protocol = u.protocol || 'http:';

        open( u.format() );
      }
      catch( e ) {
        console.log( 'environment.root is not a valid URL' );
        process.exit();
      }
    }
  );
};
