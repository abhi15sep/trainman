# Example usage

```js
// Configuration options
var config = {
  // Required
  _package: _package,
  environmentName: environmentName,
  environment: environment,
  manifest: manifest,
  // Optional, with defaults shown
  packageName: config._package.name,
  publicDir: 'public',
  indexOutputPath: 'index.html',
  assetOutputPath: 'assets',
  versionedAssets: true,
  addSHAToVersion: true,
  devHost: 'localhost',
  devPort: 8082,
  livereload: false
};

// Initialization
trainman = require('trainman')(config);

// Installing Gulp task sets
trainman.install('build');
trainman.install('server');
trainman.install('deploy');
```

# Command-line switches

--deployment / -d
Build for deployment (this option is automatically set to true when running the "deploy" task)

# Command-line arguments

--code_name / -c
Property code_name override

The following arguments will override values specified in the config object

--host / -h
Development server hostname

--port / -p
Development server port number
