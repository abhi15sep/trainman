var path = require('path');

module.exports = function(plugins, config) {
  'use strict';

  plugins.gulp.task('deploy', ['build'], function() {
    var s3Options = function(index) {
      return {
        headers: {
          'Cache-Control': 'max-age=' + (index ? '180' : '604800') + ', no-transform, public'
        }
      };
    };

    var key, secret;
    if (config.environmentName === 'production') {
      key = process.env.AWS_ACCESS_KEY;
      secret = process.env.AWS_SECRET_KEY;
    } else {
      key = process.env.DEVELOPER_AWS_ACCESS_KEY;
      secret = process.env.DEVELOPER_AWS_SECRET_KEY;
    }

    var s3Configuration = {
      key: key,
      secret: secret,
      bucket: config.environment.deploy.bucket,
      region: config.environment.deploy.region
    };

    return plugins.mergeStream(
      plugins.gulp.
        src(path.join(config.publicDir, config.indexOutputFile)).
        pipe(plugins.s3(s3Configuration, s3Options(true))),
      plugins.gulp.
        src([path.join(publicDir, '/**'), '!' + path.join(config.publicDir, config.indexOutputFile)]).
        pipe(plugins.s3(s3Configuration, s3Options()))
    );
  });
};
