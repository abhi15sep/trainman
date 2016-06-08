'use strict';

var path = require( 'path' );

var concat = require( 'gulp-concat' ),
    gulp = require( 'gulp' ),
    insert = require( 'gulp-insert' ),
    uglify = require( 'gulp-uglify' );

var log = require( '../utils' ).log,
    queueStreams = require( '../utils' ).queueStreams;

module.exports = function( config, omitLogs, callback ) {
  if ( !omitLogs ) log( 'javascripts' );

  var sources = [].concat( config.manifest.javascripts || [] );

  if ( sources.length < 1 ) {
    if ( typeof callback === 'function' ) {
      return callback();
    }
    else {
      return;
    }
  }

  var stream = queueStreams( sources ).
    pipe( concat( config.assetBasename + '.js' ) ).
    pipe( insert.prepend( '"use strict";' ) ).
    pipe( insert.append( 'window.versionString="' + config.buildVersion + '";' ) );

  if ( config.compact ) {
    stream = stream.pipe( uglify( { mangle: false } ) );
  }

  return stream.
    pipe( gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) );
};
