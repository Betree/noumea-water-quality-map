import React from "react"

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet',
  'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

export default class MonthSlider extends React.Component {
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
      <span className="title is-5">
        {this.indexToDateString(this.state.currentValue)}
      </span>
      </div>
    )
  }

  indexToDateString(idx) {
    if (!this.props.values)
      return ''
    if (idx === -1)
      idx = this.props.values.length - 1
    const date = new Date(this.props.values[idx])
    return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
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
