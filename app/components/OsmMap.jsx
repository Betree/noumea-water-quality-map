import React from "react"
import ReactDOM from "react-dom"
import L from "leaflet"
import pegasus from "@typicode/pegasus"

const MENU_BAR_SIZE = 50
const MAP_ID = "main-map"
const OSM_URL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTRIB = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'

export default class Map extends React.Component {
  constructor(props) {
    super(props)
    this.state = {height: 0}

    // Preload GeoJSON
    this.geoJSONRequest = null;
    if (props.geoJSONFile != null) {
      this.geoJSONRequest = pegasus(props.geoJSONFile)
      this.geoJSONRequest.overrideMimeType("application/json")
    }
  }

  componentWillMount() {
    this.resetHeight()
  }

  componentDidMount() {
    // Reset map container height on window resize
    window.addEventListener("resize", this.resetHeight.bind(this));

    // Initialize map
    this.map = L.map(MAP_ID);
    var osm = new L.TileLayer(OSM_URL, {
      minZoom: 13,
      maxZoom: 18,
      attribution: OSM_ATTRIB
    })
    this.map.setView(this.props.initialLocation, this.props.initialZoom)
    if (this.props.bounds != null)
      this.map.setMaxBounds(this.props.bounds);
    this.map.addLayer(osm);

    if (this.geoJSONRequest == null)
      return;

    // Retrieve GeoJSON and put in on the map
    this.geoJSONRequest.then(
      // Success handler
      (data, xhr) => {
        //this.geoJSONData = data;
        // this.redrawGeoJSON();
        this.geoJSONLayer = L.geoJSON(data, this.props.geoJSONParams).addTo(this.map)
      },
      // Error handler
      (data, xhr) => {
        console.error(data, xhr.status)
      }
    );
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resetHeight.bind(this));
  }

  render() {
    return <div id={MAP_ID} style={{height: this.state.height}}></div>
  }

  redrawGeoJSON() {
    this.geoJSONLayer.eachLayer((layer) => {this.geoJSONLayer.resetStyle(layer)});
    // Should also reset popup...etc
  }

  resetHeight() {
    this.setState({height: window.innerHeight})
  }
}

Map.defaultProps = {
  initialLocation: new L.LatLng(0, 0),
  initialZoom: 1,
  bounds: [[-22.33, 166.28], [-22.18, 166.61]],
  geoJSONFile: null,
  geoJSONParams: {}
}
