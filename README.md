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

## Community

* [`graphiql-workspace-app`](https://gitlab.com/kachkaev/graphiql-workspace-app) — an instance of [`crete-react-app`](https://github.com/facebookincubator/create-react-app) that wrapps `graphiql-workspace`. Can be easily launched at `graphiql.yourcompany.com` as a lightweight Docker container (&lt;&nbsp;20MB). Hosted on GitLab.
