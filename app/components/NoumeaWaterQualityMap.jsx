import React from "react"
import ReactDOM from "react-dom"
import L from "leaflet"
import _ from "underscore"

import {default as OsmMap} from "./OsmMap"

const GEOJSON_FILE =      "data/geojson/simple.geojson"
const INITIAL_LOCATION =  new L.LatLng(-22.26, 166.45)
const BOUNDS =            [[-22.33, 166.28], [-22.18, 166.61]]
const INITIAL_ZOOM =      13
const COLORS = {
  GOOD: "#00afef",
  AVERAGE: "#00af50",
  BAD: "#e16b09",
  DANGEROUS: "#ff0000",
}

export default class NoumeaWaterQualityMap extends React.Component {
  render() {
    const geoJSONParams = {
      style: (f) => this.getStyle(f)
    }

    return <div>
      <OsmMap initialLocation={INITIAL_LOCATION} initialZoom={INITIAL_ZOOM}
      boundToStartRegion={true} bounds={BOUNDS}
      geoJSONFile={GEOJSON_FILE} geoJSONParams={geoJSONParams}
      ref={(map) => {this.map = map}}
      />

    </div>;

    //     <Slider id="date-select-slider" />
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
