'use strict';

var gulp = require( 'gulp' ),
    runSequence = require( 'run-sequence' );

var clean = require( './clean' ),
    connect = require( 'gulp-connect' ),
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
        return stylesheets( config, callback ).pipe( connect.reload() );
      }
    );

    gulp.task(
      'javascripts',
      function( callback ) {
        return javascripts( config, callback ).pipe( connect.reload() );
      }
    );

    gulp.task(
      'assets',
      function( callback ) {
        return assets( config, callback ).pipe( connect.reload() );
      }
    );

    gulp.task(
      'templates',
      function( callback ) {
        return templates( config, callback ).pipe( connect.reload() );
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
