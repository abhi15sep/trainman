'use strict';

var path = require( 'path' ),
    child_process = require( 'child_process' );

var gulp = require( 'gulp' ),
    s3 = require( 'gulp-s3' ),
    streamqueue = require( 'streamqueue' );

var log = require( './utils' ).log;

var s3Options = function( index ) {
  return {
    headers: {
      'Cache-Control': ( index ? 'no-cache' : 'public, no-transform, max-age=31536000' )
    }
  };
};

module.exports = function( config, standalone, environment ) {
  gulp.task(
    'deploy',
    [ 'build' ],
    function() {
      var bucket, key, secret;

      try {
        bucket = config.environment.deploy.bucket;
      }
      catch( e ) {
        console.log( 'The specified environment does not have a deploy configuration' );
        process.exit();
      }

      log( 'Deploying to bucket "' + bucket + '"' );

      if ( environment === 'production' ) {
        key = process.env.AWS_ACCESS_KEY;
        secret = process.env.AWS_SECRET_KEY;
      }
      else {
        key = process.env.DEVELOPER_AWS_ACCESS_KEY;
        secret = process.env.DEVELOPER_AWS_SECRET_KEY;
      }

      var s3Configuration = {
        key: key,
        secret: secret,
        bucket: bucket,
        region: config.environment.deploy.region
      };

      var indexSource = config.indexOutputPath ? path.join( config.publicDir, config.indexOutputPath ) : '',
          otherSources = [ path.join( config.publicDir, '/**' ) ];

      if ( indexSource ) {
        otherSources.push( '!' + path.join( config.publicDir, config.indexOutputPath ) );
      }

      child_process.exec( 'say -v Whisper "It has been done"' );

      return streamqueue(
        { objectMode: true },
        gulp.
          src( indexSource ).
          pipe( s3( s3Configuration, s3Options( true ) ) ),
        gulp.
          src( otherSources ).
          pipe( s3( s3Configuration, s3Options() ) )
      );
    }
  );
};
