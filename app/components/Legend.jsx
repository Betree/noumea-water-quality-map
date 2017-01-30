import React from "react"
import _ from "underscore"

export default class Legend extends React.Component {
  constructor(props) {
    super(props)
    this.state = {isExpanded: props.isExpanded}
  }

  toggleExpanded() {
    this.setState({isExpanded: !this.state.isExpanded})
  }

  render() {
    const {legend} = this.props
    const {isExpanded} = this.state
    return (
      <div id="legend" className={isExpanded ? 'expanded' : ''}>
        <button className="button expand-button" onClick={() => this.toggleExpanded()}>
          {isExpanded ? '-' : 'Légende'}
        </button>
        {Object.entries(legend).map(([value, color]) =>
          <div className="legend-entry" key={value}>
            <div className="color-block" style={{backgroundColor: color}}/>
            <span className="legend-value">{value}</span>
          </div>
        )}
      </div>
  )}
}
