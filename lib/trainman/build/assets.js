'use strict';

var path = require( 'path' );

var gulp = require( 'gulp' );

var log = require( '../utils' ).log,
    queueStreams = require( '../utils' ).queueStreams;

module.exports = function( config, standalone ) {
  if ( standalone ) log( 'assets' );

  var sources = [].concat( config.manifest.assets || [] );

  if ( sources.length < 1 ) return;

  return queueStreams( sources ).
    pipe( gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) );
};
