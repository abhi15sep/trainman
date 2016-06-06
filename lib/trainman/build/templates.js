'use strict';

var path = require( 'path' );

var angularTemplatecache = require( 'gulp-angular-templatecache' ),
    concat = require( 'gulp-concat' ),
    connect = require( 'gulp-connect' ),
    gulp = require( 'gulp' ),
    streamqueue = require( 'streamqueue' ),
    template = require( 'gulp-template' );

var locals = require( './locals' ),
    queueStreams = require( '../utils' ).queueStreams;

module.exports = function( config, callback ) {
  if ( global.EXPRESS_SERVER ) console.log( 'Trainman: templates' );

  var sources = [].concat( config.manifest.templates || [] );

  if ( sources.length < 1 ) {
    if ( typeof callback === 'function' ) {
      return callback();
    }
    else {
      return;
    }
  }

  var streams = [],
      source,
      cwdRegex = new RegExp( process.cwd() + '\/?', 'g' );

  var templateLocals = locals( config );

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
        stream = stream.pipe( template( templateLocals ) );

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
      pipe( angularTemplatecache( {
        transformUrl: function( url ) {
          url = url.replace( cwdRegex, '' );
          url = path.join( config.templateAssetOutputPath || config.assetOutputPath, url );

          return url;
        },
        module: config.angularModule
      } ) ).
      pipe( concat( config.assetBasename + '.templates.js' ) ).
      pipe( gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) );

    streams.queue( stream );
  }

  return streams.done().
    pipe( connect.reload() );
};
