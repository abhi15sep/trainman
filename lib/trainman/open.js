var url = require('url'),
    open = require('open');

module.exports = function(plugins, config) {
  'use strict';

  if (!config.environment.root) {
    console.log('environment.root is required when opening a project');
    process.exit();
  }

  plugins.gulp.task('open', function(callback) {
    var u = url.parse(config.environment.root);
    u.protocol = u.protocol || 'http:';

    open(u.format());
  });
};
