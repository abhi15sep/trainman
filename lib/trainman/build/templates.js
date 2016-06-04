'use strict';

var path = require( 'path' );

var locals = require( './locals' );

module.exports = function( sources, plugins, config, options ) {
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

      stream = plugins.gulp.src( file, { base: source.base } );

      if ( file === config.indexOutputPath ) {
        stream = stream.pipe( plugins.template( templateLocals ) );

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
};
