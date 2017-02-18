#!/bin/sh

set -e

if [ ! -d "node_modules/.bin" ]; then
  echo "Be sure to run \`npm install\` before building graphiql-workspace."
  exit 1
fi

# just in case
export PATH=node_modules/.bin/:$PATH

rm -rf dist/ && mkdir -p dist/
babel src --out-dir dist/

echo "Bundling graphiql-workspace.js..."
browserify -g browserify-shim -s graphiqlWorkspace dist/index.js > graphiql-workspace.js

echo "Bundling graphiql-workspace.css..."
cat css/*.css > graphiql-workspace.css

echo "Done"