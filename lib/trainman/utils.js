'use strict';

var path = require( 'path' );

var colors = require( 'colors/safe' ),
    dedupe = require( 'gulp-dedupe' ),
    gulp = require( 'gulp' ),
    streamqueue = require( 'streamqueue' );

var colorFunction = colors[ process.env.TRAINMAN_LOG_STYLE || 'rainbow' ];

exports.log = function( message ) {
  console.log( colors.grey( '[' ) + colorFunction( 'TRAINMAN' ) + colors.grey( ']' ), message );
};

exports.queueStreams = function( sources ) {
  var source,
      file,
      stream,
      streams = streamqueue( { objectMode: true } );

  for ( var i = 0; i < sources.length; i++ ) {
    source = sources[ i ];

    for ( var j = 0; j < source.files.length; j++ ) {
      file = source.files[ j ];

      stream = gulp.src( file, { base: source.base } );
      streams.queue( stream );
    }
  }

  return streams.done().pipe( dedupe() );
};

exports.watchList = function( sources, stylesheets ) {
  sources = [].concat( sources || [] );
  var list = [];

  for ( var i = 0; i < sources.length; i++ ) {
    if ( stylesheets ) {
      list = list.concat( path.join( sources[ i ].base, '/**/*.{css,scss}' ) );
    }
    else {
      list = list.concat( sources[ i ].files );
    }
  }

  return list;
};
