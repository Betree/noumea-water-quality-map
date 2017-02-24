import React from "react"
import ReactDOM from "react-dom"
import L from "leaflet"
import _ from "underscore"
import moment from "moment"
import pegasus from "@typicode/pegasus"
import Color from "color"

import {default as OsmMap} from "./OsmMap"
import {default as Legend} from "./Legend"
import {default as MonthSlider} from "./MonthSlider"

const GEOJSON_FILE =      "data/geojson/simple.geojson"
const BASE_SOURCE_URL =   "https://github.com/Betree/noumea-water-quality-map/blob/gh-pages/data/raw/"
const INITIAL_LOCATION =  new L.LatLng(-22.285, 166.45)
const BOUNDS =            [[-22.35, 166.28], [-22.20, 166.61]]
const INITIAL_ZOOM =      14
const DATE_FORMAT =       "DD/MM/YYYY HH:mm:ss"
const PRETTY_DATE_FORMAT = "DD/MM/YYYY à HH:mm:ss"

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

    this.state = {dates: []}
  }

  render() {
    return <div>
      <OsmMap initialLocation={INITIAL_LOCATION} initialZoom={INITIAL_ZOOM}
        bounds={BOUNDS} minZoom={INITIAL_ZOOM}
        ref={(map) => {this.map = map}}
        initialMonth={new Date()}
        />
      <Legend legend={COLORS} isExpanded={true}/>
      <div id="footer">
        <div id="date-select-slider-container">
          <MonthSlider values={this.state.dates}
            defaultIndex={this.state.dates.length - 1}
            handleChange={(date) => this.handleDateChange(date)}
          />
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
        // Convert all dates to date objects and store them
        const reportDates = []
        for (var {properties} of data.features) {
          if (properties.data) {
            _.each(properties.data, (d) => {
              d.date = moment(d.date, DATE_FORMAT)
              if (!_.find(reportDates, (date) => date.isSame(d.date, 'day')))
                reportDates.push(d.date)
            })
          }
        }
        reportDates.sort((a,b) => a.diff(b))

        // Add GeoJSON to map and initialize it
        const pointToLayer = (pt, pos) => L.marker(pos, {title: pt.properties.name})
        this.map.addGeoJson(data, {pointToLayer})
        this.setState({dates: reportDates})
        this.updateLayers()
      },
      // Error handler
      (data, xhr) => {
        console.log(data)
      }
    );
  }

  updateLayers() {
    this.map.geoJSONLayer.eachLayer((layer) => {
      if (layer.feature.geometry.type === "Point")
        this.updateMarker(layer)
      else {
        this.updateArea(layer)
      }
    });
  }

  updateArea(area) {
    const associatedPoints = _.filter(this.map.geoJSONLayer._layers, (l) => {
      const {geometry: {type}, properties: {name}} = l.feature
      return type === "Point" && area.feature.properties.points.includes(name)
    })
    const statuses = _.map(associatedPoints, (p) => {
      const currentData = this.getCurrentData(p.feature.properties.data)
      return STATUSES.indexOf(this.getQualityStatus(currentData))
    })

    const worstStatusText = STATUSES[_.max(statuses)]
    area.setStyle({
      // Assumes that data is sorted with more recent date at last position
      fillColor: COLORS[worstStatusText],
      fillOpacity: 0.9
    })
  }

  updateMarker(marker) {
    const {properties} = marker.feature
    const currentData = this.getCurrentData(properties.data)
    const status = this.getQualityStatus(currentData)
    const iconUrl = STATUSES_ICONS[status]
    const icon = L.icon({iconUrl, iconSize: [25, 41], iconAnchor: [12, 40]})
    marker.setIcon(icon)
    const popupContent = this.generateMarkerPopup(status, currentData, properties)

    var popup;
    if (!marker._popup) {
      popup = marker._popup ? marker._popup : L.popup({maxWidth: 450})
      marker.bindPopup(popup)
    }
    else {
      popup = marker._popup.setContent(popupContent)
    }
    popup.setContent(popupContent)
    popup.update()
  }

  generateMarkerPopup(status, currentData, {data, name}) {
    if (currentData === null)
      return `<div class="map-popup"><h4 class="point-name">Point ${name}</h4>Aucune donnée pour ce point pour le mois sélectionné</div>`
    return (`<div class="map-popup">
      <h4 class="point-name">Point ${name}</h4>
      <p>
        Le <b>${currentData.date.format(PRETTY_DATE_FORMAT)}</b> le niveau de pollution
        pour ce point était : <b style="color: ${COLORS[status]};">${status}</b>
      </p>
      ${this.generateHtmlTableForData(currentData, data)}
      <hr>
      <a target="_blank" href="${BASE_SOURCE_URL + currentData.source_file}">
        <span class="icon is-small">🔗</span>
        Source
      </a>
    </div>`)}

  generateHtmlTableForData(currentData, allData) {
    const dataIdx = _.findLastIndex(allData, currentData)
    const lines = []

    for (var data of _.filter(allData, (d) => d.date.isSame(currentData.date, 'month'))) {
      const escherichiaColiStatus = this.getEscherichiaColiStatus(data.escherichia_coli)
      const intestinalEnterococciStatus = this.getIntestinalEnterococciStatus(data.intestinal_enterococci)
      const prettyDate = data.date.isSame(currentData.date, 'day') ?
        `<b>${data.date.format(DATE_FORMAT)}</b>` :
        data.date.format(DATE_FORMAT)

      lines.push(`<tr>
        <td>${prettyDate}</td>
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
      return date.isSameOrBefore(this.selectedDate, 'day')
    })
    return lastDataForSelectedMonth === -1 ? null : data[lastDataForSelectedMonth]
  }

  getQualityStatus(data) {
    if (data === null)
      return STATUS_OUTDATED
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
