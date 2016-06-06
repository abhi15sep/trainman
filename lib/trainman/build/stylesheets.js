'use strict';

var path = require( 'path' );

var cleanCss = require( 'gulp-clean-css' ),
    concat = require( 'gulp-concat' ),
    connect = require( 'gulp-connect' ),
    gulp = require( 'gulp' ),
    sass = require( 'gulp-sass' );

var queueStreams = require( '../utils' ).queueStreams;

module.exports = function( config, callback ) {
  if ( config.useExpress ) console.log( 'Trainman: stylesheets' );

  var sources = [].concat( config.manifest.stylesheets || [] );

  if ( sources.length < 1 ) {
    if ( typeof callback === 'function' ) {
      return callback();
    }
    else {
      return;
    }
  }

  var stream = queueStreams( sources ).
    pipe( sass().on( 'error', sass.logError ) ).
    pipe( concat( config.assetBasename + '.css' ) );

  if ( config.compact ) {
    stream = stream.pipe( cleanCss() );
  }

  return stream.
    pipe( gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) ).
    pipe( connect.reload() );
};
