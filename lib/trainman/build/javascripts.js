'use strict';

var path = require( 'path' );

var concat = require( 'gulp-concat' ),
    connect = require( 'connect' ),
    gulp = require( 'gulp' ),
    insert = require( 'gulp-insert' ),
    uglify = require( 'gulp-uglify' );

module.exports = function( stream, config ) {
  stream = stream.
    pipe( concat( config.assetBasename + '.js' ) ).
    pipe( insert.prepend( '"use strict";' ) ).
    pipe( insert.append( 'window.versionString="' + config.buildVersion + '";' ) );

  if ( config.compact ) {
    stream = stream.pipe( uglify( { mangle: false } ) );
  }

  return stream.
    pipe( gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) ).
    pipe( connect.reload() );
};
