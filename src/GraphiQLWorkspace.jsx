import React, {PropTypes} from 'react';

import moment from 'moment';

import {GraphiQLTab} from './GraphiQLTab';
import {AppConfig} from './config';

import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import _ from 'lodash'

export class GraphiQLWorkspace extends React.Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    onToolbar: PropTypes.func,
    proxyUrl: PropTypes.string
  }

  constructor(props) {
    super()

    this.graphiql = {}

    this.state = {
      config: props.config,
      visited: [props.config.getActiveId()]
    }

    this.bootstrapOptions = props.config.getBootstrapOptions();

    var orig = document.addEventListener
    document.addEventListener = function (name, fn) {
      // please don't look here... it's terrible and very very fragile
      if (name === 'keydown' && fn.toString().indexOf('_runQueryAtCursor') != -1) {
        console.info("Ignoring GraphiQL keydown event handler!")
      } else {
        orig.apply(document, arguments)
      }
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyHandler.bind(this), true);
  }

  keyHandler(event){
    if ((event.metaKey || event.ctrlKey) && event.keyCode === 13) {
      event.preventDefault();

      const comp = this.graphiql[this.state.config.getActiveId()]

      if (comp) {
        comp.runQueryAtCursor()
      }

      return false
    }
  }

  componentDidUpdate() {
    if (this.state.aboutToPrepare) {

      this.setState({
        aboutToPrepare: undefined,
        visited: this.visited(this.state.aboutToPrepare) ? this.state.visited : [...this.state.visited, this.state.aboutToPrepare]
      })
    }
  }

  render() {
    const tabs = this.state.config.getTabs().map(tab => {
      const label = <div>
        {_.truncate(tab.state.name)} <Button bsStyle="link" bsSize="xsmall" className="close-button" onClick={this.closeTab.bind(this, tab.getId())}><Glyphicon glyph="remove" /></Button>
      </div>

      if (this.visited(tab.getId())) {
        return <Tab key={tab.getId()} eventKey={tab.getId()} title={label}>
          <GraphiQLTab
            ref={cmp => this.graphiql[tab.getId()] = cmp}
            onToolbar={this.toolbar.bind(this)}
            hasClosed={this.state.config.state.closedTabs.length > 0}
            onNameChange={this.refresh.bind(this)}
            proxyUrl={this.props.proxyUrl}
            tab={tab}
            app={this.state.config} />
        </Tab>
      } else {
        return <Tab key={tab.getId()} eventKey={tab.getId()} title={label}><div></div></Tab>
      }
    })

    return <Tabs id="main-tabs" animation={false} className="tabs" activeKey={this.state.config.getActiveId()} onSelect={this.handleSelect.bind(this)}>
      {tabs}

      <Tab key="new" eventKey="new" title="+ New Query" className="new-tab">
        <a id="downloadAnchorElem" style={{display: "none"}}></a>
      </Tab>
    </Tabs>;
  }

  refresh() {
    this.setState({config: this.state.config})
  }

  formatDate(d) {
    return moment(d).format("YYYY-MM-DD-HH-mm-ss")
  }

  toolbar(action, arg) {
    if (action === "reopen") {
      this.state.config.reopenTab()
      this.setState({config: this.state.config, aboutToPrepare: this.state.config.getActiveId()});
    } else if (action === "export") {
      this.state.config.state.tabIds.forEach(id => {
        const comp = this.graphiql[id]

        if (comp) {
          comp.persistState()
        }
      })

      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.config.export() , null, 2));
      var dlAnchorElem = document.getElementById('downloadAnchorElem');

      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", `graphiql-workspace-${this.formatDate(new Date())}.json`);
      dlAnchorElem.click();
    } else if (action == "restore") {
      this.state.config.cleanup()
      const newConfig = new AppConfig(arg)

      this.setState({
        config: newConfig,
        visited: [],
        aboutToPrepare: newConfig.getActiveId()
      })
    } else if (action == "clean") {
      this.state.config.cleanup()
      const newConfig = new AppConfig("graphiql", this.bootstrapOptions)

      this.setState({
        config: newConfig,
        visited: [],
        aboutToPrepare: newConfig.getActiveId()
      })
    }

    if (this.props.onToolbar)
      this.props.onToolbar.apply(this, arguments)
  }

  closeTab(id, e) {
    e.preventDefault()
    e.stopPropagation()

    const comp = this.graphiql[id]

    if (comp) {
      comp.persistState()
    }

    this.state.config.removeTab(id)
    const newVisited = this.state.visited.filter(v => v != id)

    this.setState({config: this.state.config, visited: newVisited, aboutToPrepare: this.state.config.getActiveId()});
  }

  handleSelect(key) {
    if (key == "new") {
      const tab = this.state.config.addTab()

      this.setState({config: this.state.config, aboutToPrepare: tab.getId()});
    } else if (key) {
      this.state.config.state.setState({activeId: key})
      this.setState({config: this.state.config, aboutToPrepare: key});
    }
  }

  visited(idx) {
    return this.state.visited.indexOf(idx) != -1
  }
}