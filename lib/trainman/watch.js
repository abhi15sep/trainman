'use strict';

var path = require( 'path' );

var chokidar = require( 'chokidar' ),
    gulp = require( 'gulp' );

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

    return function() {
      log( 'watch' );

      chokidar.watch( 'app/stylesheets/**/*.scss', chokidarOptions ).on( 'all', function() {
        stylesheets( config )
      } );

      chokidar.watch( watchList( config.manifest.javascripts ), chokidarOptions ).on( 'all', function() {
        javascripts( config );
      } );

      chokidar.watch( watchList( config.manifest.assets ), chokidarOptions ).on( 'all', function() {
        assets( config );
      } );

      chokidar.watch( watchList( config.manifest.templates ), chokidarOptions ).on( 'all', function() {
        templates( config );
      } );
    }
  }
  else {
    gulp.watch( 'app/stylesheets/**/*.scss', [ 'stylesheets' ] );
    gulp.watch( watchList( config.manifest.javascripts  ), [ 'javascripts' ] );
    gulp.watch( watchList( config.manifest.assets ), [ 'assets' ] );
    gulp.watch( watchList( config.manifest.templates ), [ 'templates' ] );
  }
};
