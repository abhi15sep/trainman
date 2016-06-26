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

module.exports = function( config, standalone ) {
  if ( standalone ) {
    return function() {
      clean( config, true ).then( function() {
        log( 'build' );

        stylesheets( config, true );
        javascripts( config, true );
        assets( config, true );
        templates( config, true );
      } );
    }
  }
  else {
    gulp.task(
      'stylesheets',
      function( done ) {
        var stream = stylesheets( config );

        if ( stream ) {
          return stream.pipe( connect.reload() );
        }
        else {
          done();
        }
      }
    );

    gulp.task(
      'javascripts',
      function( done ) {
        var stream = javascripts( config );

        if ( stream ) {
          return stream.pipe( connect.reload() );
        }
        else {
          done();
        }
      }
    );

    gulp.task(
      'assets',
      function( done ) {
        var stream = assets( config );

        if ( stream ) {
          return stream.pipe( connect.reload() );
        }
        else {
          done();
        }
      }
    );

    gulp.task(
      'templates',
      function( done ) {
        var stream = templates( config );

        if ( stream ) {
          return stream.pipe( connect.reload() );
        }
        else {
          done();
        }
      }
    );

    gulp.task(
      'clean',
      function() {
        return clean( config );
      }
    );

    gulp.task( 'build', [ 'clean' ], function( done ) {
      runSequence( [ 'stylesheets', 'javascripts', 'assets', 'templates' ], done );
    } );
  }
};
