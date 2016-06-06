'use strict';

var path = require( 'path' );

var connect = require( 'connect' ),
    connectHistoryApiFallback = require( 'connect-history-api-fallback' ),
    gulp = require( 'gulp' ),
    morgan = require( 'morgan' ),
    runSequence = require( 'run-sequence' );

var watchList = function( sources ) {
  sources = [].concat( sources || [] );
  var list = [];

  for ( var i = 0; i < sources.length; i++ ) {
    list = list.concat( sources[ i ].files );
  }

  return list;
};

module.exports = function( config ) {
  gulp.task(
    'watch',
    function( callback ) {
      runSequence( [ 'stylesheets', 'javascripts', 'assets', 'templates' ], callback );

      gulp.watch( [ 'app/stylesheets/**/*.scss' ], [ 'stylesheets' ] );
      gulp.watch( watchList( config.manifest.javascripts  ), [ 'javascripts' ] );
      gulp.watch( watchList( config.manifest.assets ), [ 'assets' ] );
      gulp.watch( watchList( config.manifest.templates ), [ 'templates' ] );
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
