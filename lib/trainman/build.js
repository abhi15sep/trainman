'use strict';

var path = require( 'path' );

var del = require( 'del' ),
    gulp = require( 'gulp' ),
    runSequence = require( 'run-sequence' );

var stylesheets = require( './build/stylesheets' ),
    javascripts = require( './build/javascripts' ),
    assets = require( './build/assets' ),
    templates = require( './build/templates' );

module.exports = function( config ) {
  if ( !config.useExpress ) {
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
        var paths = [ path.join( config.publicDir, config.assetOutputPath, '/**/*' ) ];

        if ( config.indexOutputPath ) {
          paths.push( path.join( config.publicDir, config.indexOutputPath ) );
        }

        return del( paths );
      }
    );

    gulp.task( 'build', [ 'clean' ], function( callback ) {
      runSequence( [ 'stylesheets', 'javascripts', 'assets', 'templates' ], callback );
    } );
  }
  else {
    return function() {
      if ( config.useExpress ) console.log( 'Trainman: building' );

      stylesheets( config );
      javascripts( config );
      assets( config );
      templates( config );
    }
  }
};
