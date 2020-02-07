import React from "react";
import { Map } from 'mapbox-gl';

import "mapbox-gl/dist/mapbox-gl.css";


export class OpenSkyMap extends React.Component {

    componentDidMount(){
        const map = new Map({
            container: "map",
            style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
            center: [25, 30],
            zoom: 3
          });
        
          map.on("load", function() {
            map.addSource("positions", {
              type: "geojson",
              data: "/positions/last/geojson"
            });
        
            map.addLayer({
              id: "positions",
              type: "circle",
              source: "positions",
              paint: {
                "circle-color": "teal",
                "circle-radius": 5
              }
            });
        
            map.addSource("airports", {
              type: "geojson",
              data: "/airports/geojson"
            });
            map.addLayer({
              id: "airports",
              type: "symbol",
              source: "airports",
              layout: {
                // get the icon name from the source's "icon" property
                // concatenate the name to get an icon from the style's sprite sheet
                "icon-image": "circle-11",
                // get the title name from the source's "title" property
                "text-field": ["get", "abbrev"],
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
              }
            });
          });
    }

    render() {
      return <div id="map" className="osMap"></div>
    }
}