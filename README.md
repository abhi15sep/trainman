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

trainman.setDefault('server');
```

# Command-line switches

```sh
--deployment / -d
# Build for deployment
# This option is automatically set to true when running the "deploy" task
```

# Command-line arguments

```sh
--code_name / -c
# com.boxxspring.property.code_name meta tag override
```

The following arguments will override values specified in the config object

```sh
--host / -h
# Development server hostname
```

```sh
--port / -p
# Development server port number
```
