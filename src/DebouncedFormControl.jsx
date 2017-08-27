import React from 'react';

import _ from 'lodash'
import FormControl from 'react-bootstrap/lib/FormControl';

export class DebouncedFormControl extends React.Component {
  constructor({value, onChange}){
    super()
    this.state = {
      value
    }

    this.onChange = _.debounce(onChange, 200)
  }

  static propTypes = {
    ...FormControl.propTypes
  }

  handleChange = e => {
    e.persist()
    const val = e.target.value
    this.setState({ value: val }, () => {
      this.onChange(e)
    })
  }

  render = () => {
    const {value, onChange, ...other} = this.props
    return <FormControl value={this.state.value} onChange={this.handleChange} {...other} />
  }
}
