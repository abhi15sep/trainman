'use strict';

var path = require( 'path' );

var gulp = require( 'gulp' ),
    runSequence = require( 'run-sequence' );

var watchList = require( './utils' ).watchList;

module.exports = function( config ) {
  gulp.watch( [ 'app/stylesheets/**/*.scss' ], [ 'stylesheets' ] );
  gulp.watch( watchList( config.manifest.javascripts  ), [ 'javascripts' ] );
  gulp.watch( watchList( config.manifest.assets ), [ 'assets' ] );
  gulp.watch( watchList( config.manifest.templates ), [ 'templates' ] );
};
