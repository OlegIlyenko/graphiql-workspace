var GraphiQLTab = require('./dist/GraphiQLTab')
var GraphiQLToolbar = require('./dist/GraphiQLToolbar')
var GraphiQLWorkspace = require('./dist/GraphiQLWorkspace')
var HeaderEditor = require('./dist/HeaderEditor')
var KeepLastTaskQueue = require('./dist/KeepLastTaskQueue')
var QuerySelectionButton = require('./dist/QuerySelectionButton')
var config = require('./dist/config')

module.exports = {
  GraphiQLTab: GraphiQLTab.GraphiQLTab,
  GraphiQLToolbar: GraphiQLToolbar.GraphiQLToolbar,
  GraphiQLWorkspace: GraphiQLWorkspace.GraphiQLWorkspace,
  HeaderEditor: HeaderEditor.HeaderEditor,
  KeepLastTaskQueue: KeepLastTaskQueue.KeepLastTaskQueue,
  QuerySelectionButton: QuerySelectionButton.QuerySelectionButton,
  State: config.State,
  sameQuery: config.sameQuery,
  AppConfig: config.AppConfig,
  TabConfig: config.TabConfig
}