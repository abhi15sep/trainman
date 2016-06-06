'use strict';

var path = require( 'path' );

var gulp = require( 'gulp' );

var stylesheets = require( './build/stylesheets' ),
    javascripts = require( './build/javascripts' ),
    assets = require( './build/assets' ),
    templates = require( './build/templates' ),
    watchList = require( './utils' ).watchList;

module.exports = function( config ) {
  if ( !config.useExpress ) {
    gulp.watch( [ 'app/stylesheets/**/*.scss' ], [ 'stylesheets' ] );
    gulp.watch( watchList( config.manifest.javascripts  ), [ 'javascripts' ] );
    gulp.watch( watchList( config.manifest.assets ), [ 'assets' ] );
    gulp.watch( watchList( config.manifest.templates ), [ 'templates' ] );
  }
  else {
    return function() {
      gulp.watch( [ 'app/stylesheets/**/*.scss' ], stylesheets( config ) );
      gulp.watch( watchList( config.manifest.javascripts  ), javascripts( config ) );
      gulp.watch( watchList( config.manifest.assets ), assets( config ) );
      gulp.watch( watchList( config.manifest.templates ), templates( config ) );
    }
  }
};
