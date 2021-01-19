// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import ReactDOM from "react-dom";
import "semantic-ui-css/semantic.min.css";

import App from "./components/App";
import "./index.css";
import { defaults } from "react-chartjs-2";
defaults.global.defaultFontFamily = "Open Sans";
defaults.global.defaultFontStyle = "light";
defaults.global.defaultFontColor = "#fff";
defaults.global.defaultFontSize = "13";
ReactDOM.render(<App />, document.getElementById("root"));
