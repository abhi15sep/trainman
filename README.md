# Required config options

Here's an example.

```js
var config = {
  environmentName: environmentName,
  environment: environment,
  manifest: manifest,
  deployment: deployment,
  packageName: _package.name,
  buildVersion: _package.version
};

var options = plugins.minimist(process.argv.slice(2), {});

lorry = require('lorry')(config);

lorry.install('build');
lorry.install('server');
lorry.install('deploy');
```


# Command-line options

--host/-h
Development server hostname.

--port/-p
Development server port number.

--deployment/-d
Build for deployment. This option is automatically set to true when running the "deploy" task.
