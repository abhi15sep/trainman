'use strict';

var path = require( 'path' ),
    child_process = require( 'child_process' );

module.exports = function( plugins, config, options ) {
  var assetBasename = config.packageName + ( config.versionedAssets ? '-' + config.buildVersion : '' );

  var queueStreams = function( sources ) {
    var source,
        file,
        stream,
        streams = plugins.streamqueue( { objectMode: true } );

    for ( var i = 0; i < sources.length; i++ ) {
      source = sources[ i ];

      for ( var j = 0; j < source.files.length; j++ ) {
        file = source.files[ j ];

        stream = plugins.gulp.src( file, { base: source.base } );
        streams.queue( stream );
      }
    }

    return streams.done().pipe( plugins.dedupe() );
  };

  plugins.gulp.task(
    'stylesheets',
    function( callback ) {
      var sources = [].concat( config.manifest.stylesheets || [] );

      if ( sources.length < 1 ) return callback();

      var stream = queueStreams( sources ).
        pipe( plugins.sass().on( 'error', plugins.sass.logError ) ).
        pipe( plugins.concat( assetBasename + '.css' ) );

      if ( config.compact ) {
        stream = stream.pipe( plugins.cleanCss() );
      }

      return stream.
        pipe( plugins.gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) ).
        pipe( plugins.connect.reload() );
    }
  );

  plugins.gulp.task(
    'javascripts',
    function( callback ) {
      var sources = [].concat( config.manifest.javascripts || [] );

      if ( sources.length < 1 ) return callback();

      var stream = queueStreams( sources ).
        pipe( plugins.concat( assetBasename + '.js' ) ).
        pipe( plugins.insert.prepend( '"use strict";' ) ).
        pipe( plugins.insert.append( 'window.versionString="' + config.buildVersion + '";' ) );

      if ( config.compact ) {
        stream = stream.pipe( plugins.uglify( { mangle: false } ) );
      }

      return stream.
        pipe( plugins.gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) ).
        pipe( plugins.connect.reload() );
    }
  );

  plugins.gulp.task(
    'assets',
    function( callback ) {
      var sources = [].concat( config.manifest.assets || [] );

      if ( sources.length < 1 ) return callback();

      return queueStreams( sources ).
        pipe( plugins.gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) ).
        pipe( plugins.connect.reload() );
    }
  );

  plugins.gulp.task(
    'templates',
    function( callback ) {
      var sources = [].concat( config.manifest.templates || [] );

      if ( sources.length < 1 ) return callback();

      var root = config.environment.root,
          dependencies = config.environment.dependencies || {},
          metaTags = config.environment.metaTags;

      if ( config.deployment ) {
        if ( !config.environment.root ) {
          console.log( 'environment.root is required when building a project for deployment' );
          process.exit();
        }
      }
      else {
        var localhost = '//' + config.devHost + ':' + config.devPort;

        root = localhost;

        if ( metaTags ) {
          metaTags[ 'com.boxxspring.asset.url' ] = localhost;

          var codeNameOverride = options.code_name || options.c;

          if ( codeNameOverride ) {
            metaTags[ 'com.boxxspring.property.code_name' ] = codeNameOverride;
          }
        }
      }

      root += path.join( '/', config.assetOutputPath, '/' );

      var timestamp = new Date().toString(),
          user = child_process.execSync( 'git config user.name' ).toString().replace( '\n', '' ),
          buildSignature = 'BUILD_TIME: ' + timestamp + '\n' +
                           'VERSION: ' + config.buildVersion + '\n' +
                           'USER: ' + user;

      var stylesheetUrls = [],
          javascriptUrls = [];

      stylesheetUrls.push.apply( stylesheetUrls, dependencies.stylesheets || [] );
      stylesheetUrls.push( root + assetBasename + '.css' );

      javascriptUrls.push.apply( javascriptUrls, dependencies.javascripts || [] );
      javascriptUrls.push( root + assetBasename + '.js' );

      if ( config.concatenateTemplates ) {
        javascriptUrls.push( root + assetBasename + '.templates.js' );

        if ( !config.angularModule ) {
          console.log( 'config.angularModule is required when using concatenateTemplates' );
          process.exit();
        }
      }

      var locals = {
        stylesheetUrls: stylesheetUrls,
        javascriptUrls: javascriptUrls,

        dependentStylesheetUrls: dependencies.stylesheets || [],
        dependentJavascriptUrls: dependencies.javascripts || [],

        stylesheetUrl: root + assetBasename + '.css',
        javascriptUrl: root + assetBasename + '.js',

        metaTags: metaTags || [],
        buildSignature: buildSignature,
        version: 'Using "version" here has been deprecated. Please use "buildSignature" instead.'
      };

      if ( config.environment.locals ) {
        plugins.extend( true, locals, config.environment.locals );
      }

      var streams = [],
          source,
          cwdRegex = new RegExp( process.cwd() + '\/?', 'g' );

      for ( var i = 0; i < sources.length; i++ ) {
        source = sources[ i ];

        var isIndex,
            file,
            destination,
            stream,
            streams = plugins.streamqueue( { objectMode: true } ),
            concatenatedStreams = plugins.streamqueue( { objectMode: true } );

        for ( var j = 0; j < source.files.length; j++ ) {
          file = source.files[ j ];

          stream = plugins.gulp.src( file, { base: source.base } ).
            pipe( plugins.template( locals ) );

          if ( file === config.indexOutputPath ) {
            destination = config.publicDir;
            isIndex = true;
          }
          else {
            destination = path.join( config.publicDir, config.assetOutputPath );
            isIndex = false;
          }

          if ( config.concatenateTemplates && !isIndex ) {
            concatenatedStreams.queue( stream );
          }
          else {
            stream = stream.pipe( plugins.gulp.dest( destination ) );
            streams.queue( stream );
          }
        }
      }

      if ( config.concatenateTemplates ) {
        stream = concatenatedStreams.done().
          pipe( plugins.angularTemplatecache( {
            transformUrl: function( url ) {
              url = url.replace( cwdRegex, '' );
              url = path.join( config.templateAssetOutputPath || config.assetOutputPath, url );

              return url;
            },
            module: config.angularModule
          } ) ).
          pipe( plugins.concat( assetBasename + '.templates.js' ) ).
          pipe( plugins.gulp.dest( path.join( config.publicDir, config.assetOutputPath ) ) );

        streams.queue( stream );
      }

      return streams.done().
        pipe( plugins.connect.reload() );
    }
  );

  plugins.gulp.task(
    'clean',
    function() {
      var paths = [ path.join( config.publicDir, config.assetOutputPath, '/**/*' ) ];

      if ( config.indexOutputPath ) {
        paths.push( path.join( config.publicDir, config.indexOutputPath ) );
      }

      return plugins.del( paths );
    }
  );

  plugins.gulp.task( 'build', [ 'clean' ], function( callback ) {
    plugins.runSequence( [ 'stylesheets', 'javascripts', 'assets', 'templates' ], callback );
  } );
};
