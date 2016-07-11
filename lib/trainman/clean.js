'use strict';

var path = require( 'path' );

var del = require( 'del' );

var log = require( './utils' ).log;

module.exports = function( config, standalone ) {
  if ( standalone ) log( 'clean' );

  var paths = [ path.join( config.publicDir, config.assetOutputPath, '/**/*' ) ];

  if ( !standalone && config.indexOutputPath ) {
    paths.push( path.join( config.publicDir, config.indexOutputPath ) );
  }

  return del( paths );
};
