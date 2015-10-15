var plugins = require('gulp-load-plugins')({
  pattern: '*',
  replaceString: /^gulp(-|\.)/
});

var options = plugins.minimist(process.argv.slice(2), {});

module.exports = function(config) {
  'use strict';

  var lorryConfig = {
    packageName: config._package.name
  };

  var deployment = false,
      gitSHA;

  if (options.deployment || options.d || process.argv.indexOf('deploy') > 0) {
    deployment = true;
    gitSHA = plugins.syncExec('git rev-parse --short HEAD').stdout.replace('\n', '');
  }

  lorryConfig.deployment = deployment;
  lorryConfig.buildVersion = config._package.version + (gitSHA ? '-' + gitSHA : '');

  if (!deployment && (options.override || options.o)) {
    plugins.extend(true, config.environment, config.environmentOverride || {});
  }

  plugins.extend(config, lorryConfig);

  return {
    install: function(task) {
      console.log('INSTALLING ' + task);
      require('./lorry/' + task)(plugins, config);
    }
  }
};
