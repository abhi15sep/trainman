'use strict';

var path = require( 'path' );

var angularTemplatecache = require( 'gulp-angular-templatecache' ),
    dedupe = require( 'gulp-dedupe' ),
    gulpConcat = require( 'gulp-concat' ),
    gulp = require( 'gulp' ),
    minimist = require( 'minimist' ),
    streamqueue = require( 'streamqueue' ),
    template = require( 'gulp-template' );

var locals = require( './locals' ),
    log = require( '../utils' ).log,
    queueStreams = require( '../utils' ).queueStreams;

var options = minimist( process.argv.slice( 2 ), {} );

module.exports = function( config, standalone ) {
  if ( standalone ) log( 'templates' );

  var sources = [].concat( config.manifest.templates || [] );

  if ( sources.length < 1 ) return;

  var streams = [],
      source,
      cwdRegex = new RegExp( process.cwd() + '\/?', 'g' );

  var templateLocals = locals( config ),
      codeNameOverride;

  if ( !standalone ) {
    codeNameOverride = options.code_name || options.c;
  }

  for ( var i = 0; i < sources.length; i++ ) {
    source = sources[ i ];

    var isIndex,
        file,
        destination,
        stream,
        streams = streamqueue( { objectMode: true } ),
        concatenatedStreams = streamqueue( { objectMode: true } );

    for ( var j = 0; j < source.files.length; j++ ) {
      file = source.files[ j ];

      stream = gulp.src( file, { base: source.base } );

      if ( file === config.indexOutputPath ) {
        stream = stream.pipe( template( templateLocals( null, codeNameOverride ) ) );

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
        stream = stream.pipe( gulp.dest( destination ) );
        streams.queue( stream );
      }
    }
  }

  if ( config.concatenateTemplates ) {
    stream = concatenatedStreams.done().
      pipe( dedupe() ).
      pipe( angularTemplatecache( {
        transformUrl: function( url ) {
          url = url.replace( cwdRegex, '' );
          url = path.join( config.templateAssetOutputPath || config.assetOutputPath, url );

          return url;
        },
        module: config.angularModule
      } ) ).
      pipe( gulpConcat( config.assetBasename + '.templates.js' ) ).
      pipe( gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) );

    streams.queue( stream );
  }

  return streams.done();
};
