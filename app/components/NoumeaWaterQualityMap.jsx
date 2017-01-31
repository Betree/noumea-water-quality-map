import React from "react"
import ReactDOM from "react-dom"
import L from "leaflet"
import _ from "underscore"
import pegasus from "@typicode/pegasus"
import Color from "color"

import {default as OsmMap} from "./OsmMap"
import {default as Legend} from "./Legend"
import {default as MonthSlider} from "./MonthSlider"

const GEOJSON_FILE =      "data/geojson/simple.geojson"
const INITIAL_LOCATION =  new L.LatLng(-22.26, 166.45)
const BOUNDS =            [[-22.33, 166.28], [-22.18, 166.61]]
const INITIAL_ZOOM =      13
const DATE_FORMAT =       "";
const POPUP_HISTORY_TABLE_SIZE = 8;

const STATUSES = ["Inconnu", "Bon", "Moyen", "Mauvais", "Nécessite la fermeture de la baignade"]
const [STATUS_OUTDATED, STATUS_GOOD, STATUS_AVERAGE, STATUS_BAD, STATUS_DANGEROUS] = STATUSES

const COLORS = {}
COLORS[STATUS_GOOD] =       "#00afef",
COLORS[STATUS_AVERAGE] =    "#00af50",
COLORS[STATUS_BAD] =        "#e16b09",
COLORS[STATUS_DANGEROUS] =  "#ff0000",
COLORS[STATUS_OUTDATED] =   "#333333"

const STATUSES_ICONS = {}
STATUSES_ICONS[STATUS_GOOD] =       "images/marker-good.png",
STATUSES_ICONS[STATUS_AVERAGE] =    "images/marker-average.png",
STATUSES_ICONS[STATUS_BAD] =        "images/marker-bad.png",
STATUSES_ICONS[STATUS_DANGEROUS] =  "images/marker-dangerous.png",
STATUSES_ICONS[STATUS_OUTDATED] =   "images/marker-outdated.png"

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
              handleChange={(date) => this.handleDateChange(date)}
            />
          }
        </div>
      </div>
    </div>
  }

  handleDateChange(date) {
    this.selectedDate = date
    this.updateLayers()
  }

  componentDidMount() {
    this.geoJSONRequest.then(
      (data, xhr) => {
        const pointToLayer = (pt, pos) => L.marker(pos, {title: pt.properties.name})
        this.map.addGeoJson(data, {pointToLayer})
        this.setState({dates: this.extractGeoJSONData(data)})
        this.updateLayers()
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

  updateLayers() {
    this.map.geoJSONLayer.eachLayer((layer) => {
      if (layer.feature.geometry.type === "Point")
        this.updateMarker(layer)
      //TODO else
    });
  }

  updateMarker(marker) {
    const {properties} = marker.feature
    const currentData = this.getCurrentData(properties.data)
    const status = this.getQualityStatus(currentData)
    const iconUrl = STATUSES_ICONS[status]
    const icon = L.icon({iconUrl, iconSize: [25, 41], iconAnchor: [12, 40]})
    marker.setIcon(icon)
    marker.bindPopup(this.generateMarkerPopup(status, currentData, properties))
  }

  generateMarkerPopup(status, currentData, {data, name}) {
    console.log(currentData)
    return (`<div class="map-popup">
      <h4>Point ${name}</h4>
      <p>
        Le <b>${currentData.date.replace(" ", " à ")}</b> le niveau de pollution
        pour ce point était <b style="color: ${COLORS[status]};">${status}</b>.
      </p>
      <h5>Derniers relevés :</h5>

        ${this.generateHtmlTableForData(currentData, data)}
      </table>
      <hr>
      <a href="data/raw/xxx.pdf">
        <span class="icon is-small"><i class="fa fa-link"></i></span>
        Source
      </a>
    </div>`)}

  generateHtmlTableForData(currentData, allData) {
    const dataIdx = _.findLastIndex(allData, currentData)
    const lines = []

    for (var i = dataIdx; i > dataIdx - POPUP_HISTORY_TABLE_SIZE && i >= 0; i--) {
      const data = allData[i]
      const escherichiaColiStatus = this.getEscherichiaColiStatus(data.escherichia_coli)
      const intestinalEnterococciStatus = this.getIntestinalEnterococciStatus(data.intestinal_enterococci)
      lines.push(`<tr>
        <td>${data.date}</td>
        <td style="color: ${COLORS[escherichiaColiStatus]};">
          ${data.escherichia_coli}
        </td>
        <td style="color: ${COLORS[intestinalEnterococciStatus]};">
          ${data.intestinal_enterococci}
        </td>
      </tr>`)
    }
    return `<table class="all-data">
      <thead>
        <th>Date du prélèvement</th>
        <th>Escherichia coli (NPP/100ml)</th>
        <th>Entérocoques intestinaux (NPP/100ml)</th>
      <thead>
      <tbody>
        ${lines.join('')}
      </tbody>
    </table>`
  }

  getCurrentData(data) {
    // Get latest feature data for selected month
    const lastDataForSelectedMonth = _.findLastIndex(data, ({date}) => {
      const dataYearMonth = this.getYearMonthDateFromFrDatetimeStr(date)
      return this.isSameMonth(dataYearMonth, this.selectedDate)
    })
    return lastDataForSelectedMonth === -1 ? null : data[lastDataForSelectedMonth]
  }

  isSameMonth(date1, date2) {
    return date1.getYear() === date2.getYear() && date1.getMonth() === date2.getMonth()
  }

  getAreaStyle(feature) {
    //const data = this.getFeatureData(feature)
    return {
      // Assumes that data is sorted with more recent date at last position
      fillColor: COLORS["OUTDATED"],
      fillOpacity: 0.9
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
