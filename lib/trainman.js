var plugins = require('gulp-load-plugins')({
  pattern: '*',
  replaceString: /^gulp(-|\.)/
});

var options = plugins.minimist(process.argv.slice(2), {});

module.exports = function(projectConfig) {
  'use strict';

  var config = {
    packageName: projectConfig._package.name,
    publicDir: 'public',
    indexOutputPath: 'index.html',
    assetOutputPath: 'assets',
    versionedAssets: true,
    addSHAToVersion: true,
    devHost: options.host || options.h || 'localhost',
    devPort: options.port || options.p || 8082,
    livereload: false
  };

  plugins.extend(true, config, projectConfig);

  if (projectConfig.theme) {
    var themeEnvironment,
        themeManifest = projectConfig.theme.manifest || {};

    try {
      themeEnvironment = projectConfig.theme.environments[projectConfig.environmentName];
    } catch(e) {
      themeEnvironment = {};
    }

    for (var key in themeManifest) {
      projectConfig.manifest[key] = projectConfig.manifest[key] ? [].concat(projectConfig.manifest[key]) : [];
      projectConfig.manifest[key] = projectConfig.manifest[key].concat(themeManifest[key]);
    }

    plugins.extend(true, projectConfig.environment, themeEnvironment);
  }

  var deployment = false,
      gitSHA;

  if (options.deployment || options.d || process.argv.indexOf('deploy') > 0) {
    config.deployment = true;

    if (config.addSHAToVersion) {
      gitSHA = plugins.syncExec('git rev-parse --short HEAD').stdout.replace('\n', '');
    }
  }

  config.buildVersion = projectConfig._package.version + (gitSHA ? '-' + gitSHA : '');

  try {
    config.compact = !!(config.deployment && projectConfig.environment.deploy.compact);
  } catch(e) {
    config.compact = false;
  }

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
