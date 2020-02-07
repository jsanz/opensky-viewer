import React from "react";
import { render } from "react-dom";
import { OpenSkyMap } from "./map"

import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiPageSideBar,
  EuiTitle
} from "@elastic/eui";

import "@elastic/eui/dist/eui_theme_dark.css";
import "./index.scss";

const App = () => (
    <EuiPage>
      <EuiPageSideBar>
        <EuiPageHeader>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>Open Sky</h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </EuiPageHeader>
      </EuiPageSideBar>
      <EuiPageBody>
        <EuiPageContent>
          <OpenSkyMap />
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
);

render(<App />, document.getElementById("root"));
