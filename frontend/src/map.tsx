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

import { Feature } from "geojson";
import {
  Map,
  NavigationControl,
  FullscreenControl,
  GeoJSONSource
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface OpenSkyFeature {
  callsign: string;
  originCountry: string;
  geoAltitude: number;
  timePosition: Date;
  velocity: number;
}
interface OpenSkyMapState {
  map: Map;
  lastFeature: OpenSkyFeature;
  totalCount: number;
}

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

  getFormatedTime(date: Date) {
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }

  componentDidMount() {
    const map = new Map({
      container: "map",
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [25, 30],
      zoom: 3
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
          "circle-radius": 3
        }
      });
      map.addLayer({
        id: "positions-labels",
        type: "symbol",
        source: "positions",
        paint: {
          "text-color": "#017D73",
          "text-halo-width": 2,
          "text-halo-color": "white"
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
          "circle-radius": 5
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
          "text-anchor": "top"
        }
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
                    {this.getFormatedTime(this.state.lastFeature.timePosition)}
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
                <p>{this.state.totalCount}</p>
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
