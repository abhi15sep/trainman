var plugins = require('gulp-load-plugins')({
  pattern: '*',
  replaceString: /^gulp(-|\.)/
});

var options = plugins.minimist(process.argv.slice(2), {});

module.exports = function(config) {
  'use strict';

  var defaultConfig = {
    packageName: config._package.name,
    devHost: options.host || options.h || 'localhost',
    devPort: options.port || options.p || 8082
  };

  var deployment = false,
      gitSHA;

  if (options.deployment || options.d || process.argv.indexOf('deploy') > 0) {
    deployment = true;
    gitSHA = plugins.syncExec('git rev-parse --short HEAD').stdout.replace('\n', '');
  }

  defaultConfig.deployment = deployment;
  defaultConfig.buildVersion = config._package.version + (gitSHA ? '-' + gitSHA : '');

  if (!deployment && (options.override || options.o)) {
    plugins.extend(true, config.environment, config.environmentOverride || {});
  }

  plugins.extend(config, defaultConfig);

  return {
    install: function(taskName) {
      require('./lorry/' + taskName)(plugins, config);
    },

    setDefault: function(taskName) {
      plugins.gulp.task('default', [taskName]);
    }
  }
};
