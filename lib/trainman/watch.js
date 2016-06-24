'use strict';

var path = require( 'path' );

var gulp = require( 'gulp' ),
    mapStream = require( 'map-stream' ),
    tinylr = require( 'tiny-lr' )();

var stylesheets = require( './build/stylesheets' ),
    javascripts = require( './build/javascripts' ),
    assets = require( './build/assets' ),
    templates = require( './build/templates' ),
    log = require( './utils' ).log,
    watchList = require( './utils' ).watchList;

var reload = function( file, done ) {
  return mapStream( function( file, done ) {
    tinylr.changed( file.path );
    done( null, file );
  } );
};

module.exports = function( config, standalone ) {
  if ( standalone ) {
    return function( liveReload ) {
      log( 'watch' );

      gulp.watch( 'app/stylesheets/**/*.scss', function() {
        stylesheets( config ).pipe( reload() );
      } );

      gulp.watch( watchList( config.manifest.javascripts ), function() {
        javascripts( config ).pipe( reload() );
      } );

      gulp.watch( watchList( config.manifest.assets ), function() {
        assets( config ).pipe( reload() );
      } );

      gulp.watch( watchList( config.manifest.templates ), function() {
        templates( config ).pipe( reload() );
      } );

      if ( liveReload ) {
        tinylr.listen( 35729 );
        log( 'LiveReload started on port 35729' );

        process.on( 'SIGINT', function() {
          tinylr.close();
          process.exit();
        } );
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
