'use strict';

var path = require( 'path' );

var connect = require( 'gulp-connect' ),
    connectHistoryApiFallback = require( 'connect-history-api-fallback' ),
    gulp = require( 'gulp' ),
    morgan = require( 'morgan' );

var watch = require( './watch' );

module.exports = function( config ) {
  gulp.task(
    'watch',
    [ 'build' ],
    function() {
      return watch( config );
    }
  );

  gulp.task(
    'server',
    function() {
      connect.server( {
        livereload: config.livereload,
        middleware: function( connect, opt ) {
          return [
            connectHistoryApiFallback( {
              index: config.indexOutputPath ? path.join( '/', config.indexOutputPath ) : null
            } ),
            morgan( 'dev' )
          ];
        },
        port: config.devPort,
        root: config.publicDir
      } );

      gulp.start( 'watch' );
    }
  );
};
