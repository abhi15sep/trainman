'use strict';

var path = require( 'path' );

var gulpConcat = require( 'gulp-concat' ),
    gulp = require( 'gulp' ),
    insert = require( 'gulp-insert' ),
    uglify = require( 'gulp-uglify' );

var log = require( '../utils' ).log,
    queueStreams = require( '../utils' ).queueStreams;

module.exports = function( config, standalone ) {
  if ( standalone ) log( 'javascripts' );

  var sources = [].concat( config.manifest.javascripts || [] );

  if ( sources.length < 1 ) return;

  var stream = queueStreams( sources ).
    pipe( gulpConcat( config.assetBasename + '.js' ) ).
    pipe( insert.append( 'window.versionString="' + config._package.version + '";' ) );

  if ( config.setStrictMode ) {
    stream = stream.pipe( insert.prepend( '"use strict";' ) );
  }

  if ( config.compact ) {
    stream = stream.pipe( uglify( { mangle: false } ) );
  }

  return stream.
    pipe( gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) );
};
