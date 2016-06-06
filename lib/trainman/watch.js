'use strict';

var path = require( 'path' );

var chokidar = require( 'chokidar' ),
    gulp = require( 'gulp' );

var stylesheets = require( './build/stylesheets' ),
    javascripts = require( './build/javascripts' ),
    assets = require( './build/assets' ),
    templates = require( './build/templates' ),
    watchList = require( './utils' ).watchList;

module.exports = function( config ) {
  if ( config.useExpress ) {
    return function() {
      if ( config.useExpress ) console.log( 'Trainman: watch' );

      chokidar.watch( 'app/stylesheets/**/*.scss' ).on( 'all', function() {
        stylesheets( config )
      } );

      chokidar.watch( watchList( config.manifest.javascripts ) ).on( 'all', function() {
        javascripts( config );
      } );

      chokidar.watch( watchList( config.manifest.assets ) ).on( 'all', function() {
        assets( config );
      } );

      chokidar.watch( watchList( config.manifest.templates ) ).on( 'all', function() {
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
