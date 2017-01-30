import React from "react"
import ReactDOM from "react-dom"
import L from "leaflet"
import _ from "underscore"
import pegasus from "@typicode/pegasus"

import {default as OsmMap} from "./OsmMap"
import {default as Legend} from "./Legend"
import {default as MonthSlider} from "./MonthSlider"

const GEOJSON_FILE =      "data/geojson/simple.geojson"
const INITIAL_LOCATION =  new L.LatLng(-22.26, 166.45)
const BOUNDS =            [[-22.33, 166.28], [-22.18, 166.61]]
const INITIAL_ZOOM =      13
const DATE_FORMAT =       "";

const STATUSES = ["Aucune donnée", "Bon", "Moyen", "Mauvais", "Nécessite la fermeture de la baignade"]
const [STATUS_OUTDATED, STATUS_GOOD, STATUS_AVERAGE, STATUS_BAD, STATUS_DANGEROUS] = STATUSES

const COLORS = {}
COLORS[STATUS_GOOD] =       "#00afef",
COLORS[STATUS_AVERAGE] =    "#00af50",
COLORS[STATUS_BAD] =        "#e16b09",
COLORS[STATUS_DANGEROUS] =  "#ff0000",
COLORS[STATUS_OUTDATED] =   "grey"

export default class NoumeaWaterQualityMap extends React.Component {
  constructor(props) {
    super(props);
    // Preload GeoJSON
    this.geoJSONRequest = pegasus(GEOJSON_FILE)
    this.geoJSONRequest.overrideMimeType("application/json")

    this.data = null;
    this.selectedDate = new Date()

    this.state = {dates: null}
  }

  render() {
    return <div>
      <OsmMap initialLocation={INITIAL_LOCATION} initialZoom={INITIAL_ZOOM}
        boundToStartRegion={true} bounds={BOUNDS}
        ref={(map) => {this.map = map}}
        initialMonth={new Date()}
        />
      <Legend legend={COLORS} isExpanded={true}/>
      <div id="footer">
        <div id="date-select-slider-container">
          {this.state.dates &&
            <MonthSlider values={this.state.dates}
              defaultIndex={this.state.dates.length - 1}
              handleChange={(date) => this.setDate(date)}
            />
          }
        </div>
      </div>
    </div>
  }

  setDate(date) {
    this.selectedDate = date
  }

  componentDidMount() {
    const geoJSONParams = {
      style: (f) => this.getStyle(f)
    }

    this.geoJSONRequest.then(
      (data, xhr) => {
        this.map.addGeoJson(data, geoJSONParams)
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
      _.each(feature.properties.data, (d) =>
        dates.add(this.getYearMonthDateFromFrDatetimeStr(d.date).getTime())
      )
    }
    // Convert & Sort them
    dates = Array.from(dates).sort()
    return _.map(dates, (d) => new Date(d))
  }

  getYearMonthDateFromFrDatetimeStr(datetimeStr) {
    const [dateStr] = datetimeStr.split(' ')
    const [day, month, year] = dateStr.split('/')
    return new Date(year, month - 1)
  }

  getFeatureData(feature) {
    // Get latest feature data for selected month
    const {properties: {data}} = feature
    const lastDataForSelectedMonth = _.findLastIndex(data, ({date}) => {
      const dataYearMonth = this.getYearMonthDateFromFrDatetimeStr(date)
      return this.isSameMonth(dataYearMonth, this.selectedDate)
    })
    return lastDataForSelectedMonth === -1 ? null : data[lastDataForSelectedMonth]
  }

  isSameMonth(date1, date2) {
    return date1.getYear() === date2.getYear() && date1.getMonth() === date2.getMonth()
  }

  getStyle(feature) {
    const data = this.getFeatureData(feature)
    return {
      // Assumes that data is sorted with more recent date at last position
      fillColor: COLORS[this.getQualityStatus(data)],
      fillOpacity: 0.8
    }
  }

  getQualityStatus(data) {
    if (data === null)
      return 'OUTDATED'
    // Dangerousity threshold as defined by the DASS (french health comitee)
    // Get status for both bacteria, select the worst status
    const escherichiaColiStatus = this.getEscherichiaColiStatus(data.escherichia_coli)
    const intestinalEnterococciStatus = this.getIntestinalEnterococciStatus(data.intestinal_enterococci)

    const worstStatusIdx = Math.max(STATUSES.indexOf(escherichiaColiStatus),
                                  STATUSES.indexOf(intestinalEnterococciStatus))
    return STATUSES[worstStatusIdx]
  }

  getEscherichiaColiStatus(value) {
    if (value <= 100) return STATUS_GOOD
    else if (value <= 1000) return STATUS_AVERAGE
    else if (value <= 2000) return STATUS_BAD
    else if (value > 2000) return STATUS_DANGEROUS
    else return STATUS_OUTDATED
  }

  getIntestinalEnterococciStatus(value) {
    if (value <= 100) return STATUS_GOOD
    else if (value <= 370) return STATUS_AVERAGE
    else if (value > 370) return STATUS_BAD
    else return STATUS_OUTDATED
  }
}
