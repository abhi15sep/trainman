'use strict';

var path = require( 'path' );

var stylesheets = require( './build/stylesheets' ),
    locals = require( './locals' );

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

  var stylesheetsSources = [].concat( config.manifest.stylesheets || [] );

  if ( !config.useExpress ) {
    plugins.gulp.task(
      'stylesheets',
      function( callback ) {
        if ( stylesheetsSources.length < 1 ) return callback();

        stylesheets( queueStreams( stylesheetsSources ), plugins, config );
      }
    );

    plugins.gulp.task(
      'javascripts',
      function( callback ) {
        var sources = [].concat( config.manifest.javascripts || [] );

        if ( sources.length < 1 ) return callback();

        var stream = queueStreams( sources ).
          pipe( plugins.concat( config.assetBasename + '.js' ) ).
          pipe( plugins.insert.prepend( '"use strict";' ) ).
          pipe( plugins.insert.append( 'window.versionString="' + config.buildVersion + '";' ) );

        if ( config.compact ) {
          stream = stream.pipe( plugins.uglify( { mangle: false } ) );
        }

        return stream.
          pipe( plugins.gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) ).
          pipe( plugins.connect.reload() );
      }
    );

    plugins.gulp.task(
      'assets',
      function( callback ) {
        var sources = [].concat( config.manifest.assets || [] );

        if ( sources.length < 1 ) return callback();

        return queueStreams( sources ).
          pipe( plugins.gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) ).
          pipe( plugins.connect.reload() );
      }
    );

    plugins.gulp.task(
      'templates',
      function( callback ) {
        var sources = [].concat( config.manifest.templates || [] );

        if ( sources.length < 1 ) return callback();

        var streams = [],
            source,
            cwdRegex = new RegExp( process.cwd() + '\/?', 'g' );

        var templateLocals = locals( plugins, config, options );

        for ( var i = 0; i < sources.length; i++ ) {
          source = sources[ i ];

          var isIndex,
              file,
              destination,
              stream,
              streams = plugins.streamqueue( { objectMode: true } ),
              concatenatedStreams = plugins.streamqueue( { objectMode: true } );

          for ( var j = 0; j < source.files.length; j++ ) {
            file = source.files[ j ];

            stream = plugins.gulp.src( file, { base: source.base } ).
              pipe( plugins.template( templateLocals ) );

            if ( file === config.indexOutputPath ) {
              destination = config.publicDir;
              isIndex = true;
            }
            else {
              destination = path.join( config.publicDir, config.assetOutputPath );
              isIndex = false;
            }

            if ( config.concatenateTemplates && !isIndex ) {
              concatenatedStreams.queue( stream );
            }
            else {
              stream = stream.pipe( plugins.gulp.dest( destination ) );
              streams.queue( stream );
            }
          }
        }

        if ( config.concatenateTemplates ) {
          stream = concatenatedStreams.done().
            pipe( plugins.angularTemplatecache( {
              transformUrl: function( url ) {
                url = url.replace( cwdRegex, '' );
                url = path.join( config.templateAssetOutputPath || config.assetOutputPath, url );

                return url;
              },
              module: config.angularModule
            } ) ).
            pipe( plugins.concat( config.assetBasename + '.templates.js' ) ).
            pipe( plugins.gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) );

          streams.queue( stream );
        }

        return streams.done().
          pipe( plugins.connect.reload() );
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
    }
  }
};
