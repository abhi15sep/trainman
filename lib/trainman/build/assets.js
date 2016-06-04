'use strict';

var path = require( 'path' );

module.exports = function( stream, plugins, config ) {
  return stream.
    pipe( plugins.gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) ).
    pipe( plugins.connect.reload() );
};
