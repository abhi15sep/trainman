var path = require('path');

module.exports = function(plugins, config) {
  'use strict';

  var assetBasename = config.packageName + (config.versionedAssets ? '-' + config.buildVersion : '');

  plugins.gulp.task('stylesheets', function(callback) {
    var sources = [].concat(config.manifest.stylesheets || []),
        sortedSources = [];

    if (sources.length < 1)
      callback();

    for (var i = 0; i < sources.length; i++) {
      sortedSources[i] = plugins.gulp.
        src(sources[i].files, { base: sources[i].base }).
        pipe(plugins.order(sources[i].files, { base: '.' }));
    }

    var task = plugins.mergeStream.apply(null, sortedSources).
      pipe(plugins.sass().on('error', plugins.sass.logError)).
      pipe(plugins.concat(assetBasename + '.css'));

    if (config.compact) {
      task = task.pipe(plugins.minifyCss());
    }

    return task.
      pipe(plugins.gulp.dest(path.join(config.publicDir, config.assetOutputPath))).
      pipe(plugins.connect.reload());
  });

  plugins.gulp.task('javascripts', function(callback) {
    var sources = [].concat(config.manifest.javascripts || []),
        sortedSources = [];

    if (sources.length < 1)
      callback();

    for (var i = 0; i < sources.length; i++) {
      sortedSources[i] = plugins.gulp.
        src(sources[i].files, { base: sources[i].base }).
        pipe(plugins.order(sources[i].files, { base: '.' }));
    }

    var task = plugins.mergeStream.apply(null, sortedSources).
      pipe(plugins.concat(assetBasename + '.js')).
      pipe(plugins.insert.append('window.versionString="' + config.buildVersion + '";'));

    if (config.compact) {
      task = task.pipe(plugins.uglify({ mangle: false }));
    }

    return task.
      pipe(plugins.gulp.dest(path.join(config.publicDir, config.assetOutputPath))).
      pipe(plugins.connect.reload());
  });

  plugins.gulp.task('assets', function(callback) {
    var sources = [].concat(config.manifest.assets || []);

    if (sources.length < 1)
      callback();

    for (var i = 0; i < sources.length; i++) {
      sources[i] = plugins.gulp.
        src(sources[i].files, { base: sources[i].base });
    }

    return plugins.mergeStream.apply(null, sources).
      pipe(plugins.gulp.dest(path.join(config.publicDir, config.assetOutputPath))).
      pipe(plugins.connect.reload());
  });

  plugins.gulp.task('templates', function(callback) {
    var sources = [].concat(config.manifest.templates || []);

    if (sources.length < 1)
      callback();

    for (var i = 0; i < sources.length; i++) {
      sources[i] = plugins.gulp.
        src(sources[i].files, { base: sources[i].base });
    }

    var root = config.environment.root,
        dependencies = config.environment.dependencies || {},
        metaTags = config.environment.metaTags;

    if (!config.deployment) {
      var localhost = '//' + config.devHost + ':' + config.devPort;

      root = localhost;

      if (metaTags) {
        metaTags['com.boxxspring.asset.url'] = localhost;

        var codeNameOverride = options.code_name || options.c;
        if (codeNameOverride) {
          metaTags['com.boxxspring.property.code_name'] = codeNameOverride;
        }
      }
    }

    root += path.join('/', config.assetOutputPath, '/');

    var locals = {
      dependentStylesheetUrls: dependencies.stylesheets || [],
      dependentJavascriptUrls: dependencies.javascripts || [],

      stylesheetUrl: root + assetBasename + '.css',
      javascriptUrl: root + assetBasename + '.js',

      metaTags: metaTags || [],
      version: config.buildVersion
    };

    return plugins.mergeStream.apply(null, sources).
      pipe(plugins.template(locals)).
      pipe(plugins.gulp.dest(config.publicDir)).
      pipe(plugins.connect.reload());
  });

  plugins.gulp.task('clean', function() {
    var paths = [path.join(config.publicDir, config.assetOutputPath, '/**/*')];
    if (config.indexOutputPath) {
      paths.push(path.join(config.publicDir, config.indexOutputPath));
    }

    return plugins.del(paths);
  });

  plugins.gulp.task('build', ['clean'], function(callback) {
    plugins.runSequence(['stylesheets', 'javascripts', 'assets', 'templates'], callback);
  });
};
