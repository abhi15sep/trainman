'use strict';

var gulp = require( 'gulp' ),
    runSequence = require( 'run-sequence' );

var clean = require( './clean' ),
    stylesheets = require( './build/stylesheets' ),
    javascripts = require( './build/javascripts' ),
    assets = require( './build/assets' ),
    templates = require( './build/templates' ),
    log = require( './utils' ).log;

module.exports = function( config ) {
  if ( global.EXPRESS_SERVER ) {
    return function() {
      log( 'build' );

      clean( config );

      stylesheets( config );
      javascripts( config );
      assets( config );
      templates( config );
    }
  }
  else {
    gulp.task(
      'stylesheets',
      function( callback ) {
        return stylesheets( config, callback );
      }
    );

    gulp.task(
      'javascripts',
      function( callback ) {
        return javascripts( config, callback );
      }
    );

    gulp.task(
      'assets',
      function( callback ) {
        return assets( config, callback );
      }
    );

    gulp.task(
      'templates',
      function( callback ) {
        return templates( config, callback );
      }
    );

    gulp.task(
      'clean',
      function() {
        return clean( config );
      }
    );

    gulp.task( 'build', [ 'clean' ], function( callback ) {
      runSequence( [ 'stylesheets', 'javascripts', 'assets', 'templates' ], callback );
    } );
  }
};
