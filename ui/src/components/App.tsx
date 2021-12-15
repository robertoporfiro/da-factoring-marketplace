// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import {
  HashRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";

import DamlLedger from "@daml/react";

import Credentials, {
  storeCredentials,
  retrieveCredentials,
} from "../Credentials";
import { httpBaseUrl } from "../config";

import { RegistryLookupProvider } from "./common/RegistryLookup";

import LoginScreen from "./LoginScreen";
import MainScreen from "./MainScreen";
import LandingPage from "./common/LandingPage/LandingPage";
import LogoutUser from "./common/LogoutUser/LogoutUser";
import CreateMarket from "./CreateMarket";
import QueryStreamProvider from "../websocket/queryStream";
import DamlHub from "@daml/hub-react";

/**
 * React component for the entry point into the application.
 */
// APP_BEGIN
const App: React.FC = () => {
  const [credentials, setCredentials] = React.useState<Credentials | undefined>(
    retrieveCredentials()
  );

  const handleCredentials = (credentials?: Credentials) => {
    setCredentials(credentials);
    storeCredentials(credentials);
  };

  return (
    <div className='app' >
      <Router>
        <Switch>
          <Route exact path="/">
            <LandingPage onLogin={handleCredentials} />
          </Route>
          <Route exact path={`/logout`}>
            <LogoutUser
              onLogout={() => {
                handleCredentials(undefined);
                document.title = "Factoring";
              }}
            />
          </Route>
          <Route path="/login">
            <DamlHub>
              <LoginScreen onLogin={handleCredentials} />
            </DamlHub>
          </Route>

          <Route path="/create-market">
            <DamlHub>
              <CreateMarket reconnectThreshold={0} httpBaseUrl={httpBaseUrl} />
            </DamlHub>
          </Route>

          <Route
            path="/role"
            render={() => {
              return credentials ? (
                <DamlLedger
                  reconnectThreshold={0}
                  token={credentials.token}
                  party={credentials.party}
                  httpBaseUrl={httpBaseUrl}
                >
                  <DamlHub token={credentials.token}>
                    <QueryStreamProvider>
                      <RegistryLookupProvider>
                        <MainScreen
                          onLogout={() => handleCredentials(undefined)}
                        />
                      </RegistryLookupProvider>
                    </QueryStreamProvider>
                  </DamlHub>
                </DamlLedger>
              ) : (
                <Redirect to="/" />
              );
            }}
          ></Route>
        </Switch>
      </Router>
    </div>
  );
};
// APP_END

export default App;
