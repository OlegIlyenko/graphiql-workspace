import React, {PropTypes} from 'react';

import {GraphiQL} from 'graphiql/dist/components/GraphiQL';
import {GraphiQLToolbar} from './GraphiQLToolbar';
import {HeaderEditor} from './HeaderEditor';
import {QuerySelectionButton} from './QuerySelectionButton';
import {DebouncedFormControl} from './DebouncedFormControl';

import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import Table from 'react-bootstrap/lib/Table';

import {introspectionQuery} from './utility/introspectionQueries';

import {buildClientSchema} from 'graphql';

import {graphQLFetcher} from './GraphiQLSubscriptionsFetcher';
import {SubscriptionClient} from 'subscriptions-transport-ws';

import _ from 'lodash'

export class GraphiQLTab extends React.Component {
  static propTypes = {
    tab: PropTypes.object.isRequired,
    app: PropTypes.object.isRequired,
    hasClosed: PropTypes.bool.isRequired,
    onToolbar: PropTypes.func,
    onNameChange: PropTypes.func,
    proxyUrl: PropTypes.string
  }

  constructor(props) {
    super()

    this.graphiql = null
    this.subscriptionsClient = null

    this.state = {
      config: props.tab,
      appConfig: props.app,
      header: null,
      headerIdx: null,
      editedQuery: {query: props.tab.getQuery(), variables: props.tab.getVariables()}
    }
  }

  componentWillMount() {
    this.updateSchema();
  }

  runQueryAtCursor() {
    if (this.graphiql)
      this.graphiql._runQueryAtCursor()
  }

  persistState() {
    if (this.graphiql)
      this.graphiql.componentWillUnmount()
  }

  render() {
    if (this.state.config.state.collapsed)
      return this.renderCollapsed()
    else
      return this.renderExpanded()
  }

  renderCollapsed() {
    const tab = this.state.config

    let headers = <span></span>

    if (tab.state.headers.length > 0) {
      const headerList = tab.state.headers.map(h => h.name + ": " + this.headerValue(h)).join(", ")
      headers = <span>&nbsp;&nbsp;&nbsp;<strong>Headers:</strong> {headerList}</span>
    }

    return <div className="graphiql-tool-cont">
      <div className="tab-top" style={{flexDirection: "row"}}>
        <div className="graphiql-collapsed-tab" onClick={this.expand.bind(this)}>
          <strong>URL:</strong> {tab.state.url}{tab.state.proxy ? " (proxied)" : ""} {headers}<br/>
          <strong>WS:</strong> {tab.state.websocketUrl}
        </div>
        <div>
          <GraphiQLToolbar hirizontal={true} onToolbar={this.toolbar.bind(this)} hasClosed={this.props.hasClosed} />
        </div>
      </div>

      {this.renderGraphiql(tab)}
    </div>
  }

  renderExpanded() {
    const tab = this.state.config

    const url = <DebouncedFormControl
      placeholder="GraphQL endpoint URL"
      bsSize="small"
      value={tab.state.url}
      onChange={this.urlChange.bind(this)} />

    let urlInput = url

    if (this.state.appConfig.state.usedUrls.length > 0) {
      const items = this.state.appConfig.state.usedUrls.map(url =>
        <MenuItem key={url} onClick={this.setUrl.bind(this, url)}>{url}</MenuItem>)

      urlInput = <InputGroup>
        {url}
        <DropdownButton componentClass={InputGroup.Button} bsSize="small" id="used-url" title="Recent">
          {items}
        </DropdownButton>
      </InputGroup>
    }

    const websocketInput = <DebouncedFormControl
      placeholder="GraphQL WS URL"
      bsSize="small"
      value={tab.state.websocketUrl}
      onChange={this.websocketUrlChange.bind(this)} />

    let recentHeaders = ''

    if (this.state.appConfig.state.recentHeaders.length > 0) {
      const items = this.state.appConfig.state.recentHeaders.map(header => {
        const label = header.name + ": " + header.value
        const labelo = header.name + ": " + this.headerValue(header, true)
        return <MenuItem key={label} onClick={this.addHeader.bind(this, header, false)}>{labelo}</MenuItem>
      })

      recentHeaders = <DropdownButton id="recent-header" title="Recent">
        {items}
      </DropdownButton>
    }

    let headers = <div></div>

    if (this.state.config.state.headers.length > 0) {
      let values = this.state.config.state.headers.map((header, idx) => {
        return <tr key={header.name + header.value}>
          <td>{this.truncateHeaderValue(header.name)}</td>
          <td>{this.truncateHeaderValue(this.headerValue(header))}</td>
          <td>
            <Button bsStyle="link" onClick={this.editHeader.bind(this, header, idx)}><Glyphicon glyph="edit" bsSize="small" /></Button>
            <Button bsStyle="link" onClick={this.removeHeader.bind(this, header, idx)}><Glyphicon glyph="remove" bsSize="small" /></Button>
          </td>
        </tr>
      })

      headers = <Table>
        <thead>
          <tr>
            <th>Header Name</th>
            <th>Header Value</th>
            <th width="100px"></th>
          </tr>
        </thead>
        <tbody>
          {values}
        </tbody>
      </Table>
    }

    return <div className="graphiql-tool-cont">
      <div className="tab-top">
        <div className="tab-form">
          <Form horizontal>
            <FormGroup controlId="name-input">
              <Col componentClass={ControlLabel} sm={2}>Name</Col>
              <Col sm={10}><FormControl placeholder="Query name" bsSize="small" value={tab.state.name} onChange={this.nameChange.bind(this)} /></Col>
            </FormGroup>

            <FormGroup controlId="url-input" validationState={this.state.schemaError ? "error" : null}>
              <Col componentClass={ControlLabel} sm={2}>URL</Col>
              <Col sm={10}>
                {urlInput}
              </Col>
            </FormGroup>
            {this.props.proxyUrl &&
              <FormGroup>
                <Col smOffset={2} sm={10}>
                  <Checkbox checked={this.state.config.state.proxy} onChange={this.proxyChange.bind(this)}>Proxy requests</Checkbox>
                </Col>
              </FormGroup>
            }

            <FormGroup controlId="ws-input" validationState={this.state.wsError ? "error" : null}>
              <Col componentClass={ControlLabel} sm={2}>WS URL</Col>
              <Col sm={10}>
                {websocketInput}
              </Col>
            </FormGroup>

            <FormGroup controlId="headers-input">
              <Col componentClass={ControlLabel} sm={2}>Headers</Col>
              <Col sm={10}>
                <ButtonGroup>
                  <Button bsSize="small" className="header-add" onClick={this.addHeader.bind(this, null)}><Glyphicon glyph="plus" /> Add</Button>
                  <DropdownButton id="std-header" title="Standard">
                    <MenuItem key="oauth-bearer" onClick={this.addHeader.bind(this, {name: "Authorization", value: "Bearer "}, true)}>OAuth 2 Bearer Token</MenuItem>
                  </DropdownButton>
                  {recentHeaders}
                </ButtonGroup>
              </Col>
            </FormGroup>
          </Form>
        </div>

        <div className="headers">
          {headers}

          <HeaderEditor headerIdx={this.state.headerIdx} header={this.state.header} onFinish={this.headerFinish.bind(this)} />
        </div>

        <div>
          <GraphiQLToolbar onToolbar={this.toolbar.bind(this)} hasClosed={this.props.hasClosed} />
        </div>
      </div>

      {this.renderGraphiql(tab)}
    </div>
  }

  collapse() {
    this.state.config.state.setState({collapsed: true})

    this.setState({config: this.state.config})
  }

  expand() {
    this.state.config.state.setState({collapsed: false})

    this.setState({config: this.state.config})
  }

  renderGraphiql(tab) {
    let addButton = <GraphiQL.ToolbarButton title="Save Query" label="Save" onClick={this.saveQuery.bind(this)} />

    if (this.state.appConfig.hasSavedQuery(this.state.editedQuery)) {
      addButton = <GraphiQL.ToolbarButton title="Remove Query" label="Remove" onClick={this.removeQuery.bind(this)} />
    }

    return <div className="graphiql-tool-cont1">
      <GraphiQL
          ref={cmp => this.graphiql = cmp}
          storage={tab.getState()}
          query={this.state.queryUpdate ? this.state.queryUpdate.query : undefined}
          variables={this.state.queryUpdate ? this.state.queryUpdate.variables : undefined}
          schema={this.state.schema}
          fetcher={this.fetcher.bind(this)}
          onEditQuery={this.queryEdited.bind(this)}
          onEditVariables={this.variablesEdited.bind(this)}>
        <GraphiQL.Toolbar>
          <QuerySelectionButton name="History" list={tab.getHistory()} onQuery={this.onSelectedQuery.bind(this)} />
          <QuerySelectionButton name="Saved Queries" list={this.state.appConfig.getSavedQueries()} onQuery={this.onSelectedQuery.bind(this)} />
          {addButton}
        </GraphiQL.Toolbar>
      </GraphiQL>
    </div>
  }

  saveQuery() {
    this.state.appConfig.addSavedQuery(this.state.editedQuery)
    this.setState({appConfig: this.state.appConfig})
  }

  removeQuery() {
    this.state.appConfig.removeSavedQuery(this.state.editedQuery)
    this.setState({appConfig: this.state.appConfig})
  }

  componentDidUpdate() {
    if (this.state.queryUpdate) {
      this.setState({queryUpdate: undefined})
    }
  }

  onSelectedQuery(item) {
    const query = {query: item.query, variables: item.variables ? item.variables : ""}

    this.setState({editedQuery: query, queryUpdate: query})
  }

  queryEdited(query) {
    this.setState({editedQuery: {query: query, variables: this.state.editedQuery.variables}})
  }

  variablesEdited(variables) {
    this.setState({editedQuery: {query: this.state.editedQuery.query, variables: variables}})
  }

  headerValue(h, partial) {
    function replace(s) {
      if (partial) {
        const first = s.substring(0, s.length - 4)
        const last = s.substring(s.length - 4)
        return _.replace(first, /./g, "\u2022") + last
      } else {
        return _.replace(s, /./g, "\u2022")
      }
    }

    if (_.toLower(h.name) == "authorization") {
      const prefix = "Bearer "

      if (h.value.startsWith(prefix)) {
        const token = h.value.substring(prefix.length)

        return prefix + replace(token)
      } else {
        return replace(h.value)
      }
    } else {
      return h.value
    }
  }

  truncateHeaderValue(s) {
    return _.truncate(s, {length: 70})
  }

  addHeader(h, edit) {
    if (h) {
      if (edit) {
        this.setState({header: h, headerIdx: null})
      } else {
        this.headerFinish(h, null)
      }
    } else {
      this.setState({header: {name: "", value: ""}, headerIdx: null})
    }
  }

  editHeader(h, idx) {
    this.setState({header: h, headerIdx: idx})
  }

  removeHeader(h, idx) {
    this.state.config.state.headers.splice(idx, 1)
    this.state.config.state.setState({headers: this.state.config.state.headers})

    this.setState({config: this.state.config, appConfig: this.state.appConfig})
    this.closeCurrentSubscriptionsClient()
  }

  headerFinish(h, idx) {
    if (h) {
      if (idx == null) {
        this.state.config.state.setState({headers: [...this.state.config.state.headers, h]})
      } else {
        this.state.config.state.setState({headers: this.state.config.state.headers.map((header, i) => {
          if (i == idx) {
            return h
          } else {
            return header
          }
        })})
      }

      this.state.appConfig.rememberHeader(h)
    }

    this.setState({header: null, headerIdx: null})
    this.closeCurrentSubscriptionsClient()
  }

  nameChange(e) {
    this.state.config.state.setState({
      name: e.target.value
    })

    this.setState({config: this.state.config})

    if (this.props.onNameChange)
      this.props.onNameChange(e.target.value)
  }

  proxyChange(e) {
    this.state.config.state.setState({
      proxy: e.target.checked
    })

    this.setState({config: this.state.config, schemaError: false})
    this.updateSchema()
  }

  validateUrl(url) {
    const re_url = new RegExp(
      "^" +
        // protocol identifier
        "(?:(?:https?|wss?)://)" +
        // user:pass authentication
        "(?:\\S+(?::\\S*)?@)?" +
        "(?:" +
          // IP address dotted notation octets
          // excludes loopback network 0.0.0.0
          // excludes reserved space >= 224.0.0.0
          // excludes network & broacast addresses
          // (first & last IP address of each class)
          "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
          "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
          "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
        "|" +
          // localhost
          "(?:localhost)" +
        "|" +
          // host name
          "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
          // domain name
          "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
          // TLD identifier
          "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
          // TLD may end with dot
          "\\.?" +
        ")" +
        // port number
        "(?::\\d{2,5})?" +
        // resource path
        "(?:[/?#]\\S*)?" +
      "$", "i"
    );

    return re_url.test(url);
  }

  setUrl(url) {
    this.state.config.state.setState({
      url: url
    })

    if (this.validateUrl(url)) {
      this.setState({config: this.state.config, schemaError: false})
      this.updateSchema()
    } else {
      this.setState({config: this.state.config, schemaError: true})
    }
  }

  urlChange(e) {
    this.setUrl(e.target.value)
  }

  setWebsocketUrl(url) {
    this.state.config.state.setState({
      websocketUrl: url
    })

    this.closeCurrentSubscriptionsClient();

    if (url === '' || this.validateUrl(url)) {
      this.setState({config: this.state.config, wsError: false})
    } else {
      this.setState({config: this.state.config, wsError: true})
    }
  }

  websocketUrlChange(e) {
    this.setWebsocketUrl(e.target.value)
  }

  updateSchema() {
    const fetch = this.fetcher({query: introspectionQuery});

    return fetch.then(result => {
      if (result && result.data) {
        this.setState({schema: buildClientSchema(result.data), schemaError: false});
      } else {
        this.setState({schemaError: true});
      }
    }).catch(error => {
      this.setState({schemaError: true});
    });
  }

  toolbar(action) {
    if (action == 'collapse') {
      this.collapse()
    } else if (action == 'expand') {
      this.expand()
    }

    if (this.props.onToolbar) {
      this.props.onToolbar.apply(this, arguments)
    }
  }

  fetcher(params) {
    const wsUrl = this.state.config.state.websocketUrl
    if ( wsUrl && this.validateUrl(wsUrl)) {
      if(this.subscriptionsClient === null) {
        const subscriptionsClientBuilder = this.state.appConfig.bootstrapOptions.subscriptionsClientBuilder || this.defaultSubscriptionsClientBuilder
        const connectionParams = {}
        this.state.config.state.headers.forEach(h => connectionParams[h.name] = h.value)
        this.subscriptionsClient = subscriptionsClientBuilder(wsUrl, connectionParams);
      }
      
      return graphQLFetcher(this.subscriptionsClient, this.fallbackFetcher.bind(this))(params)
    } else {
      return this.fallbackFetcher(params);
    }
  }

  fallbackFetcher(params) {
    if (this.state.config.state.proxy) {
      params.url = this.state.config.state.url
      params.headers = this.state.config.state.headers
    }

    const url = this.state.config.state.proxy && this.props.proxyUrl ? this.props.proxyUrl : this.state.config.state.url

    const headers = new Headers();

    headers.append('Accept', 'application/json')
    headers.append('Content-Type', 'application/json')

    if (!this.state.config.state.proxy) {
      this.state.config.state.headers.forEach(h =>
        headers.append(h.name, h.value))
    }

    return fetch(url, {
      method: 'post',
      headers: headers,
      body: JSON.stringify(params),
      credentials: 'same-origin',
    }).then(response => response.text())
    .then(responseBody => {
      try {
        const json = JSON.parse(responseBody);

        if (this.state.appConfig.rememberUrl(this.state.config.state.url))
          this.setState({appConfig: this.state.appConfig})

        if (this.state.config.rememberQuery({query: params.query, variables: params.variables}))
          this.setState({config: this.state.config})


        return json
      } catch (error) {
        return responseBody;
      }
    });
  }

  defaultSubscriptionsClientBuilder(url, connectionParams) {
    return new SubscriptionClient(url, {
      reconnect: true,
      connectionParams
    })
  }

  closeCurrentSubscriptionsClient() {
    if(this.subscriptionsClient) {
      this.subscriptionsClient.close(true, true)
      this.subscriptionsClient = null
    }
  }
}
