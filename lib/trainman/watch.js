'use strict';

var path = require( 'path' );

var chokidar = require( 'chokidar' ),
    gulp = require( 'gulp' ),
    mapStream = require( 'map-stream' ),
    tinylr = require( 'tiny-lr' );

var stylesheets = require( './build/stylesheets' ),
    javascripts = require( './build/javascripts' ),
    assets = require( './build/assets' ),
    templates = require( './build/templates' ),
    log = require( './utils' ).log,
    watchList = require( './utils' ).watchList;

module.exports = function( config ) {
  if ( global.EXPRESS_SERVER ) {
    var chokidarOptions = {
      ignoreInitial: true
    };

    return function( liveReload ) {
      log( 'watch' );

      chokidar.watch( 'app/stylesheets/**/*.scss', chokidarOptions ).on( 'all', function( event, path ) {
        var stream = stylesheets( config );

        if ( liveReload ) {
          stream.pipe( mapStream( function( file, callback ) {
            tinylr.changed( file.path );
            callback( null, file );
          } ) );
        }
      } );

      chokidar.watch( watchList( config.manifest.javascripts ), chokidarOptions ).on( 'all', function( event, path ) {
        javascripts( config );
      } );

      chokidar.watch( watchList( config.manifest.assets ), chokidarOptions ).on( 'all', function( event, path ) {
        assets( config );
      } );

      chokidar.watch( watchList( config.manifest.templates ), chokidarOptions ).on( 'all', function( event, path ) {
        templates( config );
        // EMITTED HERE
      } );

      if ( liveReload ) {
        var lr = tinylr();
        lr.listen( 35729 );
        log( 'LiveReload started on port 35729' );
      }
    }
  }
  else {
    gulp.watch( 'app/stylesheets/**/*.scss', [ 'stylesheets' ] );
    gulp.watch( watchList( config.manifest.javascripts  ), [ 'javascripts' ] );
    gulp.watch( watchList( config.manifest.assets ), [ 'assets' ] );
    gulp.watch( watchList( config.manifest.templates ), [ 'templates' ] );
  }
};
