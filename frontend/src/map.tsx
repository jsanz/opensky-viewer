import React from "react";

import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiPageSideBar,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiTextColor
} from "@elastic/eui";

import { Feature, Point } from "geojson";
import {
  Map,
  NavigationControl,
  FullscreenControl,
  GeoJSONSource,
  Popup
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface OpenSkyFeature {
  callsign: string;
  originCountry: string;
  geoAltitude: number;
  timePosition: Date;
  velocity: number;
}

interface AirportFeature {
  abbrev: string;
  name: string;
  type: string;
}
interface OpenSkyMapState {
  map: Map;
  lastFeature: OpenSkyFeature;
  totalCount: number;
}

//const BACKEND_URL = "http://localhost:3000";
const BACKEND_URL = "";
const AIRPORTS_URL = BACKEND_URL + "/airports/geojson";
const POSITIONS_URL = BACKEND_URL + "/positions/last/geojson";
const LAST_FEATURE_URL = BACKEND_URL + "/positions/last/feature";
const COUNT_URL = BACKEND_URL + "/positions/count/all";

export class OpenSkyMap extends React.Component<{}, OpenSkyMapState> {
  constructor(props: Readonly<{}>) {
    super(props);
    this.getLastState();
    this.getTotalCount();
  }

  async getLastState() {
    const r = await fetch(LAST_FEATURE_URL);
    const f = (await r.json()) as Feature;
    if (f.properties) {
      const {
        callsign,
        originCountry,
        geoAltitude,
        timePosition,
        velocity
      } = f.properties;
      this.setState({
        lastFeature: {
          callsign,
          originCountry,
          geoAltitude,
          timePosition: new Date(timePosition),
          velocity
        }
      });
    }
  }

  async getTotalCount() {
    const c = await fetch(COUNT_URL);
    const count = await c.text();
    if (count) {
      this.setState({
        totalCount: parseInt(count)
      });
    }
  }

  formatTime(date: Date) {
    return new Intl.DateTimeFormat('en-EN',{
      hour: 'numeric', minute: 'numeric', second: 'numeric', 
      timeZone: 'UTC',
      timeZoneName: 'short'
    }).format(date);
  }

  formatNumber(number: number){
    return new Intl.NumberFormat('en-EN').format(number);
  }



  componentDidMount() {
    const map = new Map({
      container: "map",
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [25, 30],
      zoom: 3,
      hash: true
    });

    const nav = new NavigationControl();
    const fs = new FullscreenControl();
    map.addControl(nav, "top-left");
    map.addControl(fs, "top-right");

    map.on("load", function() {
      map.addSource("positions", {
        type: "geojson",
        data: POSITIONS_URL
      });
      map.addSource("airports", {
        type: "geojson",
        data: AIRPORTS_URL
      });

      map.addLayer({
        id: "positions-circles",
        type: "circle",
        source: "positions",
        paint: {
          "circle-color": "#017D73",
          "circle-radius":  {
            stops: [
              [0, 0],
              [2, 3],
              [5, 4],
              [7, 10]
            ]
          }
        }
      });
      map.addLayer({
        id: "positions-labels",
        type: "symbol",
        source: "positions",
        paint: {
          "text-color": "white",
          "text-halo-width": 2,
          "text-halo-color": "#017D73"
        },
        layout: {
          "text-field": ["get", "callsign"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [0, 0.6],
          "text-anchor": "top",
          "text-size": {
            stops: [
              [0, 0],
              [3, 0],
              [4, 10]
            ]
          }
        }
      });

      map.addLayer({
        id: "airports-circles",
        type: "circle",
        source: "airports",
        paint: {
          "circle-color": "#DD0A73",
          "circle-radius":  {
            stops: [
              [0, 2],
              [2, 5],
              [5, 6],
              [7, 14]
            ]
          }
        }
      });
      map.addLayer({
        id: "airports-labels",
        type: "symbol",
        source: "airports",
        paint: {
          "text-color": "#DD0A73",
          "text-halo-width": 2,
          "text-halo-color": "white"
        },
        layout: {
          "text-field": ["get", "abbrev"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [0, 0.6],
          "text-anchor": "top",
          "text-size": {
            stops: [
              [0, 0],
              [2, 7],
              [4, 12]
            ]
          }
        }
      });

      // Create a popup, but don't add it to the map yet.
      const popup = new Popup({
        closeButton: false,
        closeOnClick: false
      });

      map.on("mouseenter", "positions-circles", function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = "pointer";

        if (e && e.features && e.features.length > 0) {
          const feature: Feature = e.features[0];

          const coordinates = (feature.geometry as Point).coordinates.slice();
          const {callsign, originCountry, velocity, geoAltitude } = feature.properties as OpenSkyFeature;
          const description = `
          <div class="positions">
          <h3>Callsign: ${callsign}</h3>
          <p>
          Country: ${originCountry}<br/>
          Speed: ${velocity}<br/>
          Altitude: ${geoAltitude}
          </p>
          </div>
          `;

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          // Populate the popup and set its coordinates
          // based on the feature found.
          popup.setLngLat({
              lon: coordinates[0],
              lat: coordinates[1]
            }).setHTML(description)
              .addTo(map);
        }
      });

      map.on("mouseenter", "airports-circles", function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = "pointer";

        if (e && e.features && e.features.length > 0) {
          const feature: Feature = e.features[0];

          const coordinates = (feature.geometry as Point).coordinates.slice();
          const { name, abbrev, type} = feature.properties as AirportFeature;
          const description = `
          <div class="airports">
          <h3>${name} (${abbrev})</h3>
          <p>Type: ${type}</p>
          </div>
          `;

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          // Populate the popup and set its coordinates
          // based on the feature found.
          popup.setLngLat({
              lon: coordinates[0],
              lat: coordinates[1]
            }).setHTML(description)
              .addTo(map);
        }
      });

      map.on("mouseleave", "positions-circles", function() {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
      map.on("mouseleave", "airports-circles", function() {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
    });

    this.setState({
      map
    });
  }

  refreshData = () => {
    const source = this.state.map.getSource("positions") as GeoJSONSource;
    source.setData(POSITIONS_URL);
    this.getLastState();
    this.getTotalCount();
  };

  render() {
    return (
      <EuiPage>
        <EuiPageSideBar>
          <EuiPageHeader>
            <EuiPageHeaderSection>
              <EuiTitle size="l">
                <h1>Open Sky</h1>
              </EuiTitle>
            </EuiPageHeaderSection>
          </EuiPageHeader>
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiTitle size="s">
                <h2>
                  <EuiTextColor color="accent">Last position:</EuiTextColor>
                </h2>
              </EuiTitle>
              {this.state && this.state.lastFeature && (
                <EuiDescriptionList>
                  <EuiDescriptionListTitle>Callsign</EuiDescriptionListTitle>
                  <EuiDescriptionListDescription>
                    {this.state.lastFeature.callsign}
                  </EuiDescriptionListDescription>
                  <EuiDescriptionListTitle>
                    Origin Country
                  </EuiDescriptionListTitle>
                  <EuiDescriptionListDescription>
                    {this.state.lastFeature.originCountry}
                  </EuiDescriptionListDescription>
                  <EuiDescriptionListTitle>Altitude m</EuiDescriptionListTitle>
                  <EuiDescriptionListDescription>
                    {this.state.lastFeature.geoAltitude + " m"}
                  </EuiDescriptionListDescription>
                  <EuiDescriptionListTitle>Speed m/s</EuiDescriptionListTitle>
                  <EuiDescriptionListDescription>
                    {this.state.lastFeature.velocity}
                  </EuiDescriptionListDescription>
                  <EuiDescriptionListTitle>
                    Position time
                  </EuiDescriptionListTitle>
                  <EuiDescriptionListDescription>
                    {this.formatTime(this.state.lastFeature.timePosition)}
                  </EuiDescriptionListDescription>
                </EuiDescriptionList>
              )}
            </EuiFlexItem>

            {this.state && this.state.totalCount && (
              <EuiFlexItem>
                <EuiTitle size="s">
                  <h2>
                    <EuiTextColor color="accent">Positions count:</EuiTextColor>
                  </h2>
                </EuiTitle>
                <p>{this.formatNumber(this.state.totalCount)}</p>
              </EuiFlexItem>
            )}
            <EuiFlexItem>
              <EuiButton color="primary" onClick={this.refreshData}>
                Refresh
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPageSideBar>
        <EuiPageBody>
          <EuiPageContent>
            <div id="map" className="osMap"></div>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }
}
