import React from "react"
import ReactDOM from "react-dom"
import L from "leaflet"

const MENU_BAR_SIZE = 50
const MAP_ID = "main-map"
const OSM_URL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTRIB = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'

export default class OsmMap extends React.Component {
  constructor(props) {
    super(props)
    this.state = {height: 0}
  }

  componentWillMount() {
    this.resetHeight()
  }

  componentDidMount() {
    // Reset map container height on window resize
    window.addEventListener("resize", this.resetHeight.bind(this));

    // Initialize map
    const {minZoom, initialZoom, initialLocation, bounds} = this.props
    this.map = L.map(MAP_ID);
    var osm = new L.TileLayer(OSM_URL, {
      minZoom: minZoom,
      maxZoom: 18,
      attribution: OSM_ATTRIB
    })
    this.map.setView(initialLocation, initialZoom)
    if (bounds != null)
      this.map.setMaxBounds(bounds);
    this.map.addLayer(osm);
  }

  addGeoJson(geoJSON, geoJSONParams) {
    this.geoJSONLayer = L.geoJSON(geoJSON, geoJSONParams).addTo(this.map)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resetHeight.bind(this));
  }

  render() {
    return <div id={MAP_ID} style={{height: this.state.height}}></div>
  }

  resetHeight() {
    this.setState({height: window.innerHeight - MENU_BAR_SIZE})
  }
}

OsmMap.defaultProps = {
  initialLocation: new L.LatLng(0, 0),
  initialZoom: 1,
  bounds: [[-22.33, 166.28], [-22.18, 166.61]],
  geoJSON: null,
  geoJSONParams: {},
  minZoom: 1
}
