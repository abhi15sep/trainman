'use strict';

var child_process = require( 'child_process' ),
    path = require( 'path' );

var extend = require( 'extend' ),
    gulp = require( 'gulp' ),
    minimist = require( 'minimist' );

var build = require( './trainman/build' ),
    watch = require( './trainman/watch' ),
    locals = require( './trainman/build/locals' ),
    log = require( './trainman/utils' ).log;

var options = minimist( process.argv.slice( 2 ), {} );

module.exports = function( environment, projectConfig ) {
  var config = {
    publicDir: 'public',
    indexOutputPath: 'index.html',
    assetOutputPath: 'assets',
    versionedAssets: true,
    addSHAToVersion: true,
    setStrictMode: true,
    concatenateTemplates: false,
    devHost: 'localhost',
    devPort: 8082,
    livereload: false
  };

  extend( true, config, projectConfig || {} );

  try {
    config._package = config._package || require( path.join( process.cwd(), './package.json' ) );
    config.environments = config.environments || require( path.join( process.cwd(), './environments.json' ) );
    config.manifest = config.manifest || require( path.join( process.cwd(), './manifest.json' ) );
  }
  catch( e ) {
    console.log( e );
    process.exit();
  }

  environment = process.env.NODE_ENV || environment;

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
      console.log( 'Invalid environment "' + environment + '" specified' );
      process.exit();
    }
  }

  log( 'Using environment "' + environment + '"' );

  config.devHost = options.host || options.h || config.devHost;
  config.devPort = options.port || options.p || config.devPort;

  var remote,
      gitSHA,
      buildVersion;

  if (
    options.remote ||
    options.r ||
    process.argv.indexOf( 'deploy' ) > 0 ||
    ( process.env.NODE_ENV && process.env.NODE_ENV !== 'development' )
  ) {
    config.remote = true;
  }
  else {
    config.remote = false;
  }

  if ( config.addSHAToVersion ) {
    if ( process.env.NODE_ENV && process.env.NODE_ENV !== 'development' ) {
      gitSHA = process.env.SOURCE_VERSION;
    }
    else if ( config.remote ) {
      try {
        gitSHA = child_process.execSync( 'git rev-parse HEAD' ).toString().replace( '\n', '' );
      }
      catch( e ) {}
    }
  }

  buildVersion = config._package.version + ( gitSHA ? '-' + gitSHA : '' );

  config.assetBasename = config._package.name +
                         ( config.versionedAssets ? '-' + buildVersion : '' );

  try {
    config.compact = !!( config.remote && config.environment.compact );
  }
  catch( e ) {
    config.compact = false;
  }

  return {
    installTask: function( taskName ) {
      try {
        require( './trainman/' + taskName )( config, false, environment );
      }
      catch( e ) {
        console.log( e );
      }
    },

    setDefaultTask: function( taskName ) {
      gulp.task( 'default', [ taskName ] );
    },

    config: config,
    locals: locals( config, true ),
    build: build( config, true ),
    watch: watch( config, true )
  }
};
