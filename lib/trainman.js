'use strict';

var path = require( 'path' ),
    child_process = require( 'child_process' );

var extend = require( 'extend' ),
    gulp = require( 'gulp' ),
    minimist = require( 'minimist' );

var build = require( './trainman/build' ),
    watch = require( './trainman/watch' ),
    locals = require( './trainman/build/locals' ),
    log = require( './trainman/utils' ).log;

var options = minimist( process.argv.slice( 2 ), {} );

module.exports = function( projectConfig, environment ) {
  var config = {
    packageName: projectConfig._package.name,
    publicDir: 'public',
    indexOutputPath: 'index.html',
    assetOutputPath: 'assets',
    versionedAssets: true,
    addSHAToVersion: true,
    concatenateTemplates: false,
    devHost: 'localhost',
    devPort: 8082,
    livereload: false
  };

  extend( true, config, projectConfig );

  environment = process.env[ 'NODE_ENV' ] || environment;

  config.codeNameOverride = options.code_name || options.c;

  try {
    var environmentPath,
        environmentFile;

    if ( path.isAbsolute( environment ) ) {
      environmentPath = path.join( process.cwd(), environment );
    }
    else {
      environmentPath = path.join( process.cwd(), './' + environment );
    }

    environmentFile = require( environmentPath );

    if ( environmentFile.base ) {
      var environmentBase = config.environments[ environmentFile.base ] || {};
      config.environment = extend( true, environmentBase, environmentFile );
    }
    else {
      config.environment = environmentFile;
    }
  }
  catch( e ) {
    config.environment = config.environments[ environment ];

    if ( !config.environment ) {
      console.log( 'Invalid environment specified' );
      process.exit();
    }
  }

  log( 'Using environment "' + environment + '"' );

  if ( config.theme ) {
    var themeEnvironment,
        themeManifest = config.theme.manifest || {};

    try {
      themeEnvironment = config.theme.environments[ environment ];
    }
    catch( e ) {
      themeEnvironment = {};
    }

    for ( var key in themeManifest ) {
      config.manifest[ key ] = config.manifest[ key ] ? [].concat( config.manifest[ key ] ) : [];
      config.manifest[ key ] = config.manifest[ key ].concat( themeManifest[ key ] );
    }

    extend( true, config.environment, themeEnvironment );
  }

  config.devHost = options.host || options.h || config.devHost;
  config.devPort = options.port || options.p || config.devPort;

  var deployment = false,
      gitSHA;

  if (
    options.deployment ||
    options.d ||
    process.argv.indexOf( 'deploy' ) > 0 ||
    ( process.env[ 'NODE_ENV' ] && process.env[ 'NODE_ENV' ] !== 'development' )
  ) {
    config.deployment = true;

    if ( config.addSHAToVersion ) {
      gitSHA = child_process.execSync( 'git rev-parse --short HEAD' ).toString().replace( '\n', '' );
    }
  }

  config.buildVersion = config._package.version + ( gitSHA ? '-' + gitSHA : '' );
  config.assetBasename = config.packageName + ( config.versionedAssets ? '-' + config.buildVersion : '' );

  try {
    config.compact = !!( config.deployment && config.environment.deploy.compact );
  }
  catch( e ) {
    config.compact = false;
  }

  return {
    install: function( taskName ) {
      try {
        require( './trainman/' + taskName )( config );
      }
      catch( e ) {
        console.log( e );
      }
    },

    setDefault: function( taskName ) {
      gulp.task( 'default', [ taskName ] );
    },

    config: config,
    environment: environment,

    locals: locals( config, true ),
    build: build( config, true ),
    watch: watch( config, true )
  }
};
