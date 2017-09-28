# GraphiQL Workspace 

[![npm version](https://badge.fury.io/js/graphiql-workspace.svg)](https://badge.fury.io/js/graphiql-workspace)

A graphical interactive in-browser GraphQL IDE (GraphiQL), enhanced with following features:

* Tabbed navigation
* HTTP header editor
* Arbitrary endpoint support
* Workspace save/load (as JSON file)
* Local storage support
* Request proxy
* Saved queries
* Query history

You can use it in your own projects like this:

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import {GraphiQLWorkspace, AppConfig} from 'graphiql-workspace';

import 'graphiql-workspace/graphiql-workspace.css'
import 'graphiql/graphiql.css'

const config = new AppConfig("graphiql", bootstrapOptions);
ReactDOM.render(<GraphiQLWorkspace config={config} />, document.getElementById('graphiql-workspace'));
```

You still will need to add bootstrap CSS in you final application. For instance, you can use `bootstrap-loader` in webpack config. For an example application, that uses **graphiql-workspace**, check out [graphql-toolbox](http://toolbox.sangria-graphql.org/graphiql) 

Here is how it look like in your browser:

[![graphiql-workspace](https://raw.githubusercontent.com/OlegIlyenko/graphiql-workspace/master/screenshot.png)](http://toolbox.sangria-graphql.org/graphiql)

## Getting started

After you cloned the project, do the `npm install` and then use `./scripts/build.sh` or `./scripts/quickBuild.sh` to build the project.

In order to see it in action, you can use an example html page `./example/index.html`.  

## Standalone Usage

Here is an example HTML:

```html
<!doctype html>

<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>GraphiQL Workspace Example</title>

    <link rel="stylesheet" media="screen" href="//maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css">
    <link rel="stylesheet" media="screen" href="//cdnjs.cloudflare.com/ajax/libs/graphiql/0.9.3/graphiql.min.css">
    <link rel="stylesheet" media="screen" href="//cdn.jsdelivr.net/npm/graphiql-workspace@1.0.5/graphiql-workspace.min.css">

    <script src="//cdn.jsdelivr.net/npm/react@15.4.2/react.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/react-dom@15.4.2/dist/react-dom.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/graphiql-workspace@1.0.5/graphiql-workspace.min.js"></script>
  </head>
  <body>
    <div id="workspace" class="graphiql-workspace"></div>

    <script>
      var config = new graphiqlWorkspace.AppConfig("graphiql", {});

      ReactDOM.render(
        React.createElement(graphiqlWorkspace.GraphiQLWorkspace, {config: config}),
        document.getElementById('workspace'));
    </script>
  </body>
</html>
```

## Community

* [`graphiql-workspace-app`](https://gitlab.com/kachkaev/graphiql-workspace-app) — an instance of [`crete-react-app`](https://github.com/facebookincubator/create-react-app) that wrapps `graphiql-workspace`. Can be easily launched at `graphiql.yourcompany.com` as a lightweight Docker container (&lt;&nbsp;20MB). Hosted on GitLab.
