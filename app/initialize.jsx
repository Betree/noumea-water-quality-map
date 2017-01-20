import React from "react"
import ReactDOM from "react-dom"

import { default as NavMenu } from "./components/NavMenu"
import { default as NoumeaWaterQualityMap } from "./components/NoumeaWaterQualityMap"

ReactDOM.render(
  <NavMenu />,
  document.getElementById('nav-menu')
);

ReactDOM.render(
  <NoumeaWaterQualityMap />,
  document.getElementById('map-container')
);
