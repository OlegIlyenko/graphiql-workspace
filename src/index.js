var GraphiQLTab = require('./GraphiQLTab')
var GraphiQLToolbar = require('./GraphiQLToolbar')
var GraphiQLWorkspace = require('./GraphiQLWorkspace')
var HeaderEditor = require('./HeaderEditor')
var KeepLastTaskQueue = require('./KeepLastTaskQueue')
var QuerySelectionButton = require('./QuerySelectionButton')
var config = require('./config')

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