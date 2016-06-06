'use strict';

var path = require( 'path' );

var del = require( 'del' ),
    gulp = require( 'gulp' ),
    runSequence = require( 'run-sequence' );

var queueStreams = require( './utils' ).queueStreams,
    stylesheets = require( './build/stylesheets' ),
    javascripts = require( './build/javascripts' ),
    assets = require( './build/assets' ),
    templates = require( './build/templates' );

module.exports = function( config ) {
  var stylesheetsSources = [].concat( config.manifest.stylesheets || [] ),
      javascriptsSources = [].concat( config.manifest.javascripts || [] ),
      assetsSources = [].concat( config.manifest.assets || [] ),
      templatesSources = [].concat( config.manifest.templates || [] );

  if ( !config.useExpress ) {
    gulp.task(
      'stylesheets',
      function( callback ) {
        if ( stylesheetsSources.length < 1 ) return callback();

        return stylesheets( queueStreams( stylesheetsSources ), config );
      }
    );

    gulp.task(
      'javascripts',
      function( callback ) {
        if ( javascriptsSources.length < 1 ) return callback();

        return javascripts( queueStreams( javascriptsSources ), config );
      }
    );

    gulp.task(
      'assets',
      function( callback ) {
        if ( assetsSources.length < 1 ) return callback();

        return assets( queueStreams( assetsSources ), config );
      }
    );

    gulp.task(
      'templates',
      function( callback ) {
        if ( templatesSources.length < 1 ) return callback();

        return templates( templatesSources, config );
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
      if ( stylesheetsSources.length > 0 ) {
        stylesheets( queueStreams( stylesheetsSources ), config );
      }

      if ( javascriptsSources.length > 0 ) {
        javascripts( queueStreams( javascriptsSources ), config );
      }

      if ( assetsSources.length > 0 ) {
        assets( queueStreams( assetsSources ), config );
      }

      if ( templatesSources.length > 0 ) {
        templates( templatesSources, config );
      }
    }
  }
};
