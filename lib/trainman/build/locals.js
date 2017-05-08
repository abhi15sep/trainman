'use strict';

var path = require( 'path' ),
    child_process = require( 'child_process' );

var extend = require( 'extend' );

module.exports = function( config, standalone ) {
  return function( metaTagOverrides ) {
    var root,
        dependencies = config.environment.dependencies || {},
        metaTags = extend( true, {}, config.environment.metaTags ),
        metaTagOverrides = metaTagOverrides || {};

    for ( var key in metaTags ) {
      var match = metaTags[ key ].match( /env:\/\/(.*)/ );

      if ( match && match[ 1 ].length > 0 ) {
        metaTags[ key ] = process.env[ match[ 1 ] ];
      }
    }

    if ( config.remote ) {
      root = config.environment.root || metaTags[ 'com.boxxspring.asset.url' ];
    }
    else {
      var localhost = '//' + config.devHost + ':' + config.devPort;

      root = localhost;
      metaTags[ 'com.boxxspring.asset.url' ] = localhost;
    }

    root += path.join( '/', config.assetOutputPath, '/' );

    for ( var key in metaTagOverrides ) {
      metaTags[ key ] = metaTagOverrides[ key ];
    }

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
      metaTags: metaTags
    };

    if ( !standalone ) {
      locals.buildSignature = buildSignature();
    }

    return locals;
  }
};
