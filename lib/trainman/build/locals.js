'use strict';

var path = require( 'path' ),
    child_process = require( 'child_process' );

var extend = require( 'extend' );

module.exports = function( config, standalone ) {
  return function( variant, codeName ) {
    var root = config.environment.root,
        dependencies = config.environment.dependencies || {},
        metaTags = extend( true, {}, config.environment.metaTags );

    if ( config.remote ) {
      if ( !root ) {
        console.log( 'environment.root is required when building a project for remote execution' );
        process.exit();
      }
    }
    else {
      var localhost = '//' + config.devHost + ':' + config.devPort;

      root = localhost;

      if ( metaTags ) {
        metaTags[ 'com.boxxspring.asset.url' ] = localhost;
      }
    }

    if ( metaTags ) {
      if ( codeName ) {
        metaTags[ 'com.boxxspring.property.code_name' ] = codeName;
      }
      else if ( config.remote ) {
        delete metaTags[ 'com.boxxspring.property.code_name' ];
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
             'VERSION: ' + config._package.version + '\n' +
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
      metaTags: metaTags || [],
      variant: variant ? 'variant-' + variant : ''
    };

    if ( !standalone ) {
      locals.buildSignature = buildSignature()
    }

    return locals;
  }
};
