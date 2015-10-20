var plugins = require('gulp-load-plugins')({
  pattern: '*',
  replaceString: /^gulp(-|\.)/
});

var options = plugins.minimist(process.argv.slice(2), {});

module.exports = function(themeConfig) {
  'use strict';

  var config = {
    packageName: themeConfig._package.name,
    publicDir: 'public',
    indexOutputPath: 'index.html',
    assetOutputPath: 'assets',
    versionedAssets: true,
    devHost: options.host || options.h || 'localhost',
    devPort: options.port || options.p || 8082,
    livereload: false
  };

  var deployment = false,
      gitSHA;

  if (options.deployment || options.d || process.argv.indexOf('deploy') > 0) {
    deployment = true;
    gitSHA = plugins.syncExec('git rev-parse --short HEAD').stdout.replace('\n', '');
  }

  config.deployment = deployment;
  config.buildVersion = themeConfig._package.version + (gitSHA ? '-' + gitSHA : '');

  if (themeConfig.theme) {
    var themeEnvironment,
        themeManifest = themeConfig.theme.manifest || {};

    try {
      themeEnvironment = themeConfig.theme.environments[themeConfig.environmentName];
    } catch(e) {
      themeEnvironment = {};
    }

    for (var key in themeManifest) {
      themeConfig.manifest[key] = themeConfig.manifest[key] ? [].concat(themeConfig.manifest[key]) : [];
      themeConfig.manifest[key] = themeConfig.manifest[key].concat(themeManifest[key]);
    }

    plugins.extend(true, themeConfig.environment, themeEnvironment);
  }

  try {
    config.compact = !!(config.deployment && themeConfig.environment.deploy.compact);
  } catch(e) {
    config.compact = false;
  }

  plugins.extend(true, config, themeConfig);

  return {
    install: function(taskName) {
      try {
        require('./trainman/' + taskName)(plugins, config);
      }
      catch(e) {
        console.log(e);
      }
    },

    setDefault: function(taskName) {
      plugins.gulp.task('default', [taskName]);
    }
  }
};
