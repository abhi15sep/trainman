'use strict';

var path = require( 'path' );

var cleanCss = require( 'gulp-clean-css' ),
    concat = require( 'gulp-concat' ),
    connect = require( 'connect' ),
    gulp = require( 'gulp' ),
    sass = require( 'gulp-sass' );

module.exports = function( stream, config ) {
  stream = stream.
    pipe( sass().on( 'error', sass.logError ) ).
    pipe( concat( config.assetBasename + '.css' ) );

  if ( config.compact ) {
    stream = stream.pipe( cleanCss() );
  }

  return stream.
    pipe( gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) ).
    pipe( connect.reload() );
};
