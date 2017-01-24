#!/bin/sh

set -e

if [ ! -d "node_modules/.bin" ]; then
  echo "Be sure to run \`npm install\` before building graphiql-workspace."
  exit 1
fi

rm -rf dist/ && mkdir -p dist/
babel src --out-dir dist/
cat css/*.css > graphiql-workspace.css
