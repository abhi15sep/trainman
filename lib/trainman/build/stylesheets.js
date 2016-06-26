'use strict';

var path = require( 'path' );

var cleanCss = require( 'gulp-clean-css' ),
    gulpConcat = require( 'gulp-concat' ),
    gulp = require( 'gulp' ),
    sass = require( 'gulp-sass' );

var log = require( '../utils' ).log,
    queueStreams = require( '../utils' ).queueStreams;

module.exports = function( config, standalone ) {
  if ( standalone ) log( 'stylesheets' );

  var sources = [].concat( config.manifest.stylesheets || [] );

  if ( sources.length < 1 ) return;

  var stream = queueStreams( sources ).
    pipe( sass().on( 'error', sass.logError ) ).
    pipe( gulpConcat( config.assetBasename + '.css' ) );

  if ( config.compact ) {
    stream = stream.pipe( cleanCss() );
  }

  return stream.
    pipe( gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) );
};
