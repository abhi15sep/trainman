module.exports = function(plugins, config) {
  'use strict';

  plugins.gulp.task('stylesheets', function() {
    var sources = [].concat(config.manifest.stylesheets || []),
        sortedSources = [];

    for (var i = 0; i < sources.length; i++) {
      sortedSources[i] = plugins.gulp.
        src(sources[i].files, { base: sources[i].base }).
        pipe(plugins.order(sources[i].files, { base: '.' }));
    }

    var task = plugins.mergeStream.apply(null, sortedSources).
      pipe(plugins.sass().on('error', plugins.sass.logError)).
      pipe(plugins.concat(config.packageName + '-' + config.buildVersion + '.css'));

    if (config.compact) {
      task = task.pipe(plugins.minifyCss());
    }

    return task.
      pipe(plugins.gulp.dest('public/assets')).
      pipe(plugins.connect.reload());
  });

  plugins.gulp.task('javascripts', function() {
    var sources = [].concat(config.manifest.javascripts || []),
        sortedSources = [];

    for (var i = 0; i < sources.length; i++) {
      sortedSources[i] = plugins.gulp.
        src(sources[i].files, { base: sources[i].base }).
        pipe(plugins.order(sources[i].files, { base: '.' }));
    }

    var task = plugins.mergeStream.apply(null, sortedSources).
      pipe(plugins.concat(config.packageName + '-' + config.buildVersion + '.js')).
      pipe(plugins.insert.append('window.versionString="' + config.buildVersion + '";'));

    if (config.compact) {
      task = task.pipe(plugins.uglify({ mangle: false }));
    }

    return task.
      pipe(plugins.gulp.dest('public/assets')).
      pipe(plugins.connect.reload());
  });

  plugins.gulp.task('assets', function() {
    var sources = [].concat(config.manifest.assets || []);

    for (var i = 0; i < sources.length; i++) {
      sources[i] = plugins.gulp.
        src(sources[i].files, { base: sources[i].base });
    }

    return plugins.mergeStream.apply(null, sources).
      pipe(plugins.gulp.dest('public/assets')).
      pipe(plugins.connect.reload());
  });

  plugins.gulp.task('templates', function() {
    var sources = [].concat(config.manifest.templates || []);

    for (var i = 0; i < sources.length; i++) {
      sources[i] = plugins.gulp.
        src(sources[i].files, { base: sources[i].base });
    }

    // TODO: conditional here for if there's no index file?
    var nameAndVersion = config.packageName + '-' + config.buildVersion,
        metaTags = config.environment.metaTags;

    // TODO: conditional here for simple build systems with only "host", not "metaTags"

    if (!config.deployment) {
      plugins.extend(metaTags, {
        'com.boxxspring.asset.url': 'http://' + config.devHost + ':' + config.devPort
      });
    }

    var assetRoot = metaTags['com.boxxspring.asset.url'] + '/assets/';

    var locals = config.environment.locals || {};
    plugins.extend(true, locals, {
      stylesheetUrl: assetRoot + nameAndVersion + '.css',
      javascriptUrl: assetRoot + nameAndVersion + '.js',

      metaTags: metaTags || [],
      version: config.buildVersion
    });

    return plugins.mergeStream.apply(null, sources).
      pipe(plugins.template(locals)).
      pipe(plugins.gulp.dest('public')).
      pipe(plugins.connect.reload());
  });

  plugins.gulp.task('clean', function() {
    return plugins.del(['./public/index.html', './public/assets/**/*']);
  });

  plugins.gulp.task('build', ['clean'], function(callback) {
    plugins.runSequence(['stylesheets', 'javascripts', 'assets', 'templates'], callback);
  });
};
