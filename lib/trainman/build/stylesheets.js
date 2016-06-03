'use strict';

var path = require( 'path' );

module.exports = function( stream, plugins, config ) {
  stream.
    pipe( plugins.sass().on( 'error', plugins.sass.logError ) ).
    pipe( plugins.concat( config.assetBasename + '.css' ) );

  if ( config.compact ) {
    stream = stream.pipe( plugins.cleanCss() );
  }

  return stream.
    pipe( plugins.gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) ).
    pipe( plugins.connect.reload() );
};
