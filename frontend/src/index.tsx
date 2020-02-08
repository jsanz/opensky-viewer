import React from "react";
import { render } from "react-dom";
import { OpenSkyMap } from "./map"


import "@elastic/eui/dist/eui_theme_dark.css";
import "./index.scss";


render(
  <OpenSkyMap></OpenSkyMap>, 
  document.getElementById("root")
);
