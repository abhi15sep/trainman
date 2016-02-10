var path = require('path');

var s3Options = function( index ) {
  return {
    headers: {
      'Cache-Control': 'max-age=' + ( index ? '180' : '604800' ) + ', no-transform, public'
    }
  };
};

module.exports = function( plugins, config ) {
  'use strict';

  plugins.gulp.task(
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

      console.log( 'Deploying to bucket "' + bucket + '"' );

      if ( config.environmentName === 'production' ) {
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

      return plugins.mergeStream(
        plugins.gulp.
          src( indexSource ).
          pipe( plugins.s3( s3Configuration, s3Options( true ) ) ),
        plugins.gulp.
          src( otherSources ).
          pipe( plugins.s3( s3Configuration, s3Options() ) )
      );
    }
  );
};
