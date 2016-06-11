'use strict';

var path = require( 'path' ),
    url = require( 'url' );

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
    publicDir: 'public',
    indexOutputPath: 'index.html',
    assetOutputPath: 'assets',
    versionedAssets: true,
    concatenateTemplates: false,
    devHost: 'localhost',
    devPort: 8082,
    livereload: false
  };

  extend( true, config, projectConfig );

  environment = process.env[ 'NODE_ENV' ] || environment;

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

  config.devHost = options.host || options.h || config.devHost;
  config.devPort = options.port || options.p || config.devPort;

  var remote;

  if (
    options.remote ||
    options.r ||
    process.argv.indexOf( 'deploy' ) > 0 ||
    ( process.env[ 'NODE_ENV' ] && process.env[ 'NODE_ENV' ] !== 'development' )
  ) {
    config.remote = true;
  }
  else {
    remote = false;
  }

  config.assetBasename = config._package.name +
                         ( config.versionedAssets ? '-' + config._package.version : '' );

  try {
    config.compact = !!( config.remote && config.environment.compact );
  }
  catch( e ) {
    config.compact = false;
  }

  return {
    installTask: function( taskName ) {
      try {
        require( './trainman/' + taskName )( config );
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
