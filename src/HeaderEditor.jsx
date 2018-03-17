import React, {PropTypes} from 'react';

import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Modal from 'react-bootstrap/lib/Modal';

import _ from 'lodash'

export class HeaderEditor extends React.Component {
  static propTypes = {
    headerIdx: PropTypes.number,
    header: PropTypes.object,
    onFinish: PropTypes.func
  }

  constructor(props) {
    super()

    this.state = {header: props.header ? this.copy(props.header) : null}
  }

  componentWillReceiveProps(props) {
    this.setState({header: props.header ? this.copy(props.header) : null})
  }

  copy(h) {
    return {name: h.name, value: h.value}
  }

  render() {
    return <Modal show={!!this.state.header} onHide={this.hide.bind(this)} bsSize="large" aria-labelledby="contained-modal-title-base">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-base">{this.props.headerIdx == null ? 'Add' : 'Edit'} Header</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form horizontal>
          <FormGroup controlId="name-input">
            <Col componentClass={ControlLabel} sm={2}>Name</Col>
            <Col sm={10}><FormControl placeholder="Header name" bsSize="small" value={this.state.header ? this.state.header.name:  ''} onChange={this.nameChange.bind(this)} /></Col>
          </FormGroup>

          <FormGroup controlId="value-input">
            <Col componentClass={ControlLabel} sm={2}>Value</Col>
            <Col sm={10}><FormControl placeholder="Header value" bsSize="small" value={this.state.header ? this.state.header.value : ''} onChange={this.valueChange.bind(this)} /></Col>
          </FormGroup>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.ok.bind(this)} bsStyle="primary">OK</Button>
        <Button onClick={this.hide.bind(this)}>Close</Button>
      </Modal.Footer>
    </Modal>
  }

  nameChange(e) {
    this.state.header.name = e.target.value
    this.setState({header: this.state.header})
  }

  valueChange(e) {
    this.state.header.value = e.target.value
    this.setState({header: this.state.header})
  }

  hide() {
    if (this.props.onFinish)
      this.props.onFinish()
  }

  ok() {
    if (this.props.onFinish)
      this.props.onFinish(this.state.header, this.props.headerIdx)
  }
}