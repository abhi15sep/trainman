'use strict';

var path = require( 'path' );

var del = require( 'del' );

module.exports = function( config ) {
  if ( config.useExpress ) console.log( 'Trainman: clean' );

  var paths = [ path.join( config.publicDir, config.assetOutputPath, '/**/*' ) ];

  if ( config.indexOutputPath ) {
    paths.push( path.join( config.publicDir, config.indexOutputPath ) );
  }

  return del( paths );
};
