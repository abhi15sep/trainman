'use strict';

var path = require( 'path' );

var connect = require( 'connect' ),
    gulp = require( 'gulp' );

module.exports = function( stream, config ) {
  return stream.
    pipe( gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) ).
    pipe( connect.reload() );
};
