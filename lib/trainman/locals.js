'use strict';

var path = require( 'path' ),
    child_process = require( 'child_process' );

module.exports = function( plugins, config, options ) {
  var assetBasename = config.packageName + ( config.versionedAssets ? '-' + config.buildVersion : '' );

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

    metaTags: metaTags || [],
    buildSignature: buildSignature
  };

  if ( config.environment.locals ) {
    plugins.extend( true, locals, config.environment.locals );
  }

  return locals;
};
