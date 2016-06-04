'use strict';

var path = require( 'path' );

var stylesheets = require( './build/stylesheets' ),
    javascripts = require( './build/javascripts' ),
    assets = require( './build/assets' ),
    templates = require( './build/templates' );

module.exports = function( plugins, config, options ) {
  var queueStreams = function( sources ) {
    var source,
        file,
        stream,
        streams = plugins.streamqueue( { objectMode: true } );

    for ( var i = 0; i < sources.length; i++ ) {
      source = sources[ i ];

      for ( var j = 0; j < source.files.length; j++ ) {
        file = source.files[ j ];

        stream = plugins.gulp.src( file, { base: source.base } );
        streams.queue( stream );
      }
    }

    return streams.done().pipe( plugins.dedupe() );
  };

  var stylesheetsSources = [].concat( config.manifest.stylesheets || [] ),
      javascriptsSources = [].concat( config.manifest.javascripts || [] ),
      assetsSources = [].concat( config.manifest.assets || [] ),
      templatesSources = [].concat( config.manifest.templates || [] );

  if ( !config.useExpress ) {
    plugins.gulp.task(
      'stylesheets',
      function( callback ) {
        if ( stylesheetsSources.length < 1 ) return callback();

        return stylesheets( queueStreams( stylesheetsSources ), plugins, config );
      }
    );

    plugins.gulp.task(
      'javascripts',
      function( callback ) {
        if ( javascriptsSources.length < 1 ) return callback();

        return javascripts( queueStreams( javascriptsSources ), plugins, config );
      }
    );

    plugins.gulp.task(
      'assets',
      function( callback ) {
        if ( assetsSources.length < 1 ) return callback();

        return assets( queueStreams( assetsSources ), plugins, config );
      }
    );

    plugins.gulp.task(
      'templates',
      function( callback ) {
        if ( templatesSources.length < 1 ) return callback();

        return templates( templatesSources, plugins, config, options );
      }
    );

    plugins.gulp.task(
      'clean',
      function() {
        var paths = [ path.join( config.publicDir, config.assetOutputPath, '/**/*' ) ];

        if ( config.indexOutputPath ) {
          paths.push( path.join( config.publicDir, config.indexOutputPath ) );
        }

        return plugins.del( paths );
      }
    );

    plugins.gulp.task( 'build', [ 'clean' ], function( callback ) {
      plugins.runSequence( [ 'stylesheets', 'javascripts', 'assets', 'templates' ], callback );
    } );
  }
  else {
    return function() {
      if ( stylesheetsSources.length > 0 ) {
        stylesheets( queueStreams( stylesheetsSources ), plugins, config );
      }

      if ( javascriptsSources.length > 0 ) {
        javascripts( queueStreams( javascriptsSources ), plugins, config );
      }

      if ( assetsSources.length > 0 ) {
        assets( queueStreams( assetsSources ), plugins, config );
      }

      if ( templatesSources.length > 0 ) {
        templates( templatesSources, plugins, config, options );
      }
    }
  }
};
