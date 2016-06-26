# Trainman

![Thomas the Tank Engine](http://stream1.gifsoup.com/view4/1096204/train-man-o.gif)

## API

### `trainman( environment, projectConfig )`

Creates a new instance of Trainman.

##### `environment`

The name of the environment to use for building. Trainman will look for an environment with this name in `environments`.

Type: `String`  
Default value: `process.env[ 'NODE_ENV' ]`

##### `projectConfig`

The configuration object for your project, which will be merged with the default configuration.

Type: `Object`  
Default value: `{}`

### `trainman.config`

Returns the complete configuration object - `projectConfig` merged with the default configuration.

### `trainman.locals( projectLocals, codeName )`

Returns an object with the following keys:

```js
* stylesheetUrls
* javascriptUrls
* metaTags
* buildSignature // (except in standalone mode)
```

##### `projectLocals`

Any additional key/value pairs to merge into the above object.

Type: `Object`  
Default value: `{}`

##### `codeName`

The value of the `com.boxxspring.property.code_name` meta tag, if meta tags are being used.

Type: `String`  
Default value: `undefined`

### `trainman.build()`

Builds all assets as described in `manifest`.

### `trainman.watch( liveReload )`

Watches all files described in `manifest` for changes, and rebuilds changed assets.

##### `liveReload`

Whether or not to start a [LiveReload](http://livereload.com/) server on port 35729.

Type: `Boolean`  
Default value: `false`

### `trainman.installTask( taskName )`

Sets up a [Gulp](https://github.com/gulpjs/gulp) task. The available tasks are as follows:

```js
* build // build the project - equivalent to trainman.build()
* server // start a local server and watch for changes
* deploy // deploy to bucket specified in environment.deploy
* open // open browser to URL specified in environment.root
```

##### `taskName`

The name of the task being installed.

Type: `String`  
Default value: `undefined`

### `trainman.setDefaultTask( taskName )`

Sets one of the installed Gulp tasks as the default (i.e., the task that will be executed when you simply run `gulp`).

##### `taskName`

The name of the task being set as default.

Type: `String`  
Default value: `undefined`

## Example usage

```js
// Configuration options, with default values shown
var config = {
  _package: require( './package.json' ),
  environments: require( './environments.json' ),
  manifest: require( './manifest.json' ),
  publicDir: 'public',
  indexOutputPath: 'index.html',
  assetOutputPath: 'assets',
  versionedAssets: true,
  concatenateTemplates: false,
  angularModule: undefined, // (required when using concatenateTemplates)
  templateAssetOutputPath: assetOutputPath, // assetOutputPath to use in concatenated templates
  devHost: 'localhost',
  devPort: 8082,
  livereload: false
};
```

### Standalone mode

```js
// server.js

var express = require( 'express' ),
    minimist = require( 'minimist' );

var options = minimist( process.argv.slice( 2 ) ),
    environment = options.environment || options.e || 'staging';

var trainman = require( 'trainman' )( environment );

trainman.build();

if ( !process.env[ 'NODE_ENV' ] || process.env[ 'NODE_ENV' ] === 'development' ) {
  trainman.watch( true );
}

var app = express();

app.set( 'port', ( process.env.PORT || trainman.config.devPort ) );

app.use( '/assets', express.static( path.join( __dirname, trainman.config.publicDir, trainman.config.assetOutputPath ), {
  fallthrough: false
} ) );

app.get( '*', function( request, response ) {
  response.render( trainman.config.indexOutputPath, trainman.locals() );
} );

app.listen( app.get( 'port' ), function() {
  console.log( 'Node app is running on port', app.get( 'port' ) );
} );

```

### Gulp mode

```js
// gulpfile.js

var minimist = require( 'minimist' );

var options = minimist( process.argv.slice( 2 ) ),
    environment = options.environment || options.e || 'staging';

var trainman = require( 'trainman' )( environment, config );

trainman.installTask( 'build' );
trainman.installTask( 'server' );
trainman.installTask( 'deploy' );
trainman.installTask( 'open' );

trainman.setDefaultTask( 'server' );
```

## Command-line switches

```sh
--remote / -r
# Build for remote execution
# This option is automatically set to true when running the "deploy" task or when NODE_ENV is set to something other than "development"
```

## Command-line arguments

The following arguments will override values specified in the config object

```sh
--environment / -e
# Environment to use for build, deploy, and open tasks
# This can be an environment key from the environments object, or the path to a file that contains a complete environment object.
# For an example, see the "Development environment" section below.
```

```sh
--host / -h
# Development server hostname
```

```sh
--port / -p
# Development server port number
```

## Development environment

To use a custom environment for development, create a gitignored file (i.e. `development.json`) and pass this filename to gulp as the `--environment` argument.

File-based environments have the special property `base`, which specifies that this environment should extend an environment from the environments object with the given name. An example file-based environment is below.

```json
{
  "base": "production",

  "dependencies": {
    "javascripts": [
      "//sdk.boxxspring.com/angularjs-boxxspring-sdk-2.0.10.js",
      "//localhost:8081/theme-boxxspring-sdk-1.13.0.js"
    ]
  },

  "metaTags": {
    "com.boxxspring.property.code_name": "networka"
  }
}
```
