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

--deployment/-d
Build for deployment. This option is automatically set to true when running the "deploy" task.

--override/-o
Override environment settings with a local file named "environment-override.json." It should contain settings that mirror those of an existing environment. An example is provided below.

``` json
{
  "dependencies": {
    "javascripts": [
      "http://localhost:8080/angularjs-boxxspring-sdk-1.4.5.js"
    ],
    "stylesheets": [
      "http://localhost:8080/angularjs-boxxspring-sdk-1.4.5.css"
    ]
  }
}

```
