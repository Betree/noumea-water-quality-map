import React from "react"

export default class TimeSlider extends React.Component {
  constructor(props) {
    super(props)

    this.onChange = this.onChange.bind(this)

    this.input = null;
    this.state = {currentValue: this.props.defaultIndex}
  }

  render() {
    return (
      <div>
        <input type="range" defaultValue={this.props.currentValue}
          min="0" max={this.props.values.length - 1}
          onChange={this.onChange}
          ref={(ref) => this.input = ref}
        />
      <span>{this.indexToDateString(this.state.currentValue)}</span>
      </div>
    )
  }

  indexToDateString(idx) {
    return new Date(this.props.values[idx]).toLocaleDateString()
  }

  onChange() {
    this.setState({currentValue: this.input.value})
  }
}

TimeSlider.defaultProps = {
  defaultIndex: 0,
  values: []
}
