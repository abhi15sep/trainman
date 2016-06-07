'use strict';

var colors = require( 'colors/safe' ),
    dedupe = require( 'gulp-dedupe' ),
    gulp = require( 'gulp' ),
    streamqueue = require( 'streamqueue' );

exports.log = function( message ) {
  if ( global.EXPRESS_SERVER ) {
    console.log( colors.grey( '[' ) + colors.random( 'TRAINMAN' ) + colors.grey( ']' ), message );
  }
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

exports.watchList = function( sources ) {
  sources = [].concat( sources || [] );
  var list = [];

  for ( var i = 0; i < sources.length; i++ ) {
    list = list.concat( sources[ i ].files );
  }

  return list;
};
