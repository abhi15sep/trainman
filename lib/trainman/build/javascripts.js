'use strict';

var path = require( 'path' );

module.exports = function( stream, plugins, config ) {
  stream.
    pipe( plugins.concat( config.assetBasename + '.js' ) ).
    pipe( plugins.insert.prepend( '"use strict";' ) ).
    pipe( plugins.insert.append( 'window.versionString="' + config.buildVersion + '";' ) );

  if ( config.compact ) {
    stream = stream.pipe( plugins.uglify( { mangle: false } ) );
  }

  return stream.
    pipe( plugins.gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) ).
    pipe( plugins.connect.reload() );
};
