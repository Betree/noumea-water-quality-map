import React from "react"


export default class MonthSlider extends React.Component {
  constructor(props) {
    super(props)

    this.onChange = this.onChange.bind(this)

    this.input = null;
    const idx = this.props.defaultIndex < 0 ? 0 : this.props.defaultIndex
    this.state = {currentValue: idx}
  }

  componentDidUpdate(oldProps) {
    if (oldProps.values != this.props.values)
      this.setState({currentValue: this.props.values.length - 1})
  }

  render() {
    return (
      <div>
        <input
          type="range"
          value={this.state.currentValue}
          min="0"
          max={this.props.values.length - 1}
          onChange={this.onChange}
          ref={(ref) => this.input = ref}
        />
      <span className="title is-5">
        {this.indexToDateString(this.state.currentValue)}
      </span>
      </div>
    )
  }

  indexToDateString(idx) {
    if (!this.props.values || !this.props.values[idx])
      return ''
    return this.props.values[idx].format('D MMMM YYYY')
  }

  onChange() {
    this.setState({currentValue: this.input.value})
    const {handleChange, values} = this.props
    if (handleChange)
      handleChange(values[this.input.value])
  }
}

MonthSlider.defaultProps = {
  defaultIndex: 0,
  values: [],
  handleChange: null
}
