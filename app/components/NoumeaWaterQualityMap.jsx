import React from "react"
import ReactDOM from "react-dom"
import L from "leaflet"
import _ from "underscore"
import pegasus from "@typicode/pegasus"

import {default as OsmMap} from "./OsmMap"
import {default as TimeSlider} from "./TimeSlider"

const GEOJSON_FILE =      "data/geojson/simple.geojson"
const INITIAL_LOCATION =  new L.LatLng(-22.26, 166.45)
const BOUNDS =            [[-22.33, 166.28], [-22.18, 166.61]]
const INITIAL_ZOOM =      13
const DATE_FORMAT =       "";
const COLORS = {
  GOOD: "#00afef",
  AVERAGE: "#00af50",
  BAD: "#e16b09",
  DANGEROUS: "#ff0000",
}

export default class NoumeaWaterQualityMap extends React.Component {
  constructor(props) {
    super(props);
    // Preload GeoJSON
    this.geoJSONRequest = pegasus(GEOJSON_FILE)
    this.geoJSONRequest.overrideMimeType("application/json")

    this.data = null;

    this.state = {dates: null}
  }

  render() {
    return <div>
      <OsmMap initialLocation={INITIAL_LOCATION} initialZoom={INITIAL_ZOOM}
        boundToStartRegion={true} bounds={BOUNDS}
        ref={(map) => {this.map = map}}
        />
      <div id="footer">
        <div id="date-select-slider-container">
          {this.state.dates &&
            <TimeSlider values={this.state.dates}
              defaultIndex={this.state.dates.length - 1}
            />
          }
        </div>
      </div>
    </div>
  }

  componentDidMount() {
    const geoJSONParams = {
      style: (f) => this.getStyle(f)
    }

    this.geoJSONRequest.then(
      (data, xhr) => {
        // Add to map
        this.map.addGeoJson(data, geoJSONParams)
        // Init dates data
        this.setState({dates: this.extractGeoJSONData(data)})
      },
      // Error handler
      (data, xhr) => {
        console.log(data)
      }
    );
  }

  extractGeoJSONData(data) {
    // Extract all dates
    var dates = new Set()
    for (var feature of data.features) {
      // We don't care about the time
      _.each(feature.properties.data, (d) => dates.add(d.date.split(' ')[0]))
    }
    // Convert & Sort them
    return _.map(Array.from(dates), this.dateStringToTimeStamp).sort()
  }

  dateStringToTimeStamp(dateStr) {
    var day, month, year
    [day, month, year] = dateStr.split('/')
    return new Date(year, month - 1, day).getTime()
  }

  getStyle(feature) {
    return {
      // Assumes that data is sorted with more recent date at last position
      fillColor: this.getColor(_.last(feature.properties.data)),
      fillOpacity: 0.8
    }
  }

  getColor(data) {
    return COLORS['GOOD'];
  }
}
