'use strict';

var path = require( 'path' );

var vinyl = require( 'vinyl-fs' );

var log = require( '../utils' ).log,
    queueStreams = require( '../utils' ).queueStreams;

module.exports = function( config, callback ) {
  log( 'assets' );

  var sources = [].concat( config.manifest.assets || [] );

  if ( sources.length < 1 ) {
    if ( typeof callback === 'function' ) {
      return callback();
    }
    else {
      return;
    }
  }

  return queueStreams( sources ).
    pipe( vinyl.dest( path.join( config.publicDir, config.assetOutputPath ) ) );
};
