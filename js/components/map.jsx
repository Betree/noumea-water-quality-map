const MENU_BAR_SIZE = 50
const MAP_ID = "main-map"
const OSM_URL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTRIB = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'

class Map extends React.Component {
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
        L.geoJSON(data).addTo(this.map)
      },
      // Error handler (optional)
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

  resetHeight() {
    this.setState({height: window.innerHeight - MENU_BAR_SIZE});
  }
}

Map.defaultProps = {
  initialLocation: new L.LatLng(0, 0),
  initialZoom: 1,
  bounds: [[-22.33, 166.28], [-22.18, 166.61]],
  geoJSONFile: null
}

ReactDOM.render(
  <Map initialLocation={new L.LatLng(-22.26, 166.45)} initialZoom={13}
    boundToStartRegion={true} bounds={[[-22.33, 166.28], [-22.18, 166.61]]}
    geoJSONFile="data/geojson/simple.geojson"
    />,
  document.getElementById('map-container')
);
