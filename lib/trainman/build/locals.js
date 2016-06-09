'use strict';

var path = require( 'path' ),
    child_process = require( 'child_process' );

var extend = require( 'extend' );

module.exports = function( config, standalone ) {
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

      if ( config.codeNameOverride ) {
        metaTags[ 'com.boxxspring.property.code_name' ] = config.codeNameOverride;
      }
    }
  }

  root += path.join( '/', config.assetOutputPath, '/' );

  var buildSignature = function() {
    var timestamp = new Date().toString(),
        user;

    try {
      user = child_process.execSync( 'git config user.name' ).toString().replace( '\n', '' );
    }
    catch( e ) {
      user = '';
    }

    return 'BUILD_TIME: ' + timestamp + '\n' +
           'VERSION: ' + config.buildVersion + '\n' +
           'USER: ' + user;
  };

  var stylesheetUrls = [],
      javascriptUrls = [];

  stylesheetUrls.push.apply( stylesheetUrls, dependencies.stylesheets || [] );
  stylesheetUrls.push( root + config.assetBasename + '.css' );

  javascriptUrls.push.apply( javascriptUrls, dependencies.javascripts || [] );
  javascriptUrls.push( root + config.assetBasename + '.js' );

  if ( config.concatenateTemplates ) {
    javascriptUrls.push( root + config.assetBasename + '.templates.js' );

    if ( !config.angularModule ) {
      console.log( 'config.angularModule is required when using concatenateTemplates' );
      process.exit();
    }
  }

  var locals = {
    stylesheetUrls: stylesheetUrls,
    javascriptUrls: javascriptUrls,

    metaTags: metaTags || []
  };

  if ( !standalone ) {
    locals.buildSignature = buildSignature()
  }

  if ( config.environment.locals ) {
    extend( true, locals, config.environment.locals );
  }

  return locals;
};
