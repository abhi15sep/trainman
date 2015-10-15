module.exports = function(plugins, config) {
  'use strict';

  plugins.gulp.task('watch', function(callback) {
    plugins.runSequence(['stylesheets', 'javascripts', 'assets', 'templates'], callback);

    var watchList = function(sources) {
      sources = [].concat(sources || []);
      var list = [];

      for (var i = 0; i < sources.length; i++) {
        list = list.concat(sources[i].files);
      }

      return list;
    };

    plugins.gulp.watch(['app/stylesheets/**/*.scss'], ['stylesheets']);
    plugins.gulp.watch(watchList(config.manifest.javascripts), ['javascripts']);
    plugins.gulp.watch(watchList(config.manifest.assets), ['assets']);
    plugins.gulp.watch(watchList(config.manifest.templates), ['templates']);
  });

  plugins.gulp.task('server', function() {
    plugins.connect.server({
      fallback: 'public/index.html',
      livereload: config.livereload,
      middleware: function(connect, opt) {
        return [
          plugins.morgan('dev')
        ];
      },
      port: config.devPort,
      root: 'public'
    });

    plugins.gulp.start('watch');
  });
};
