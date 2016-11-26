import React, {PropTypes} from 'react';

import MenuItem from 'react-bootstrap/lib/MenuItem';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import Popover from 'react-bootstrap/lib/Popover';

import _ from 'lodash'

export class QuerySelectionButton extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    list: PropTypes.array.isRequired,
    onQuery: PropTypes.func
  }

  render() {
    if (this.getList().length  > 0) {
      const items = this.getList().map((item, idx) => {
        const popover = (
          <Popover id="popover-trigger-hover-focus" className="code-pop">
            <pre>{item.query}</pre>
            {item.variables && item.variables != "" &&
              <span>
                <strong>Variables</strong>
                <pre>{this.renderVars(item.variables)}</pre>
              </span>
            }
          </Popover>
        );

        return <MenuItem eventKey={idx} onClick={this.itemClick.bind(this, item)} key={idx}>
          <OverlayTrigger trigger={['focus', 'hover']} placement="right" overlay={popover} onClick={this.itemClick.bind(this, item)}>
            <span>{this.renderQueryLabel(item)}</span>
          </OverlayTrigger>
        </MenuItem>
      })

      return <DropdownButton id={this.props.name + "Button"} bsSize="small" title={this.props.name} className="toolbar-button bs-toolbar-button">
        {items}
      </DropdownButton>
    } else {
      return <span></span>
    }
  }

  getList() {
    return this.props.list
  }

  itemClick(item) {
    if (this.props.onQuery) {
      this.props.onQuery(item)
    }
  }

  renderVars(vars) {
    return vars
  }

  renderQueryLabel(query) {
    return _.truncate(_.replace(query.query, /\n/, " "), {length: 50})

  }
}