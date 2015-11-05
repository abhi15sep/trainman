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
    devHost: 'localhost',
    devPort: 8082,
    livereload: false
  };

  plugins.extend(true, config, projectConfig);

  console.log('Using environment "' + config.environmentName + '"');

  if (config.theme) {
    var themeEnvironment,
        themeManifest = config.theme.manifest || {};

    try {
      themeEnvironment = config.theme.environments[config.environmentName];
    } catch(e) {
      themeEnvironment = {};
    }

    for (var key in themeManifest) {
      config.manifest[key] = config.manifest[key] ? [].concat(config.manifest[key]) : [];
      config.manifest[key] = config.manifest[key].concat(themeManifest[key]);
    }

    plugins.extend(true, config.environment, themeEnvironment);
  }

  config.devHost = options.host || options.h || config.devHost;
  config.devPort = options.port || options.p || config.devPort;

  var deployment = false,
      gitSHA;

  if (
    options.deployment ||
    options.d ||
    process.argv.indexOf('deploy') > 0 ||
    (process.env['NODE_ENV'] && process.env['NODE_ENV'] !== 'development')
  ) {
    config.deployment = true;

    if (config.addSHAToVersion) {
      gitSHA = plugins.syncExec('git rev-parse --short HEAD').stdout.replace('\n', '');
    }
  }

  config.buildVersion = config._package.version + (gitSHA ? '-' + gitSHA : '');

  try {
    config.compact = !!(config.deployment && config.environment.deploy.compact);
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
