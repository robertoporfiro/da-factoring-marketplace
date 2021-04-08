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
import { PublicLedger, WellKnownPartiesProvider } from "@daml/dabl-react";

import Credentials, {
  computeCredentials,
  storeCredentials,
  retrieveCredentials,
} from "../Credentials";
import { httpBaseUrl } from "../config";

import { RegistryLookupProvider } from "./common/RegistryLookup";
import { useDablParties } from "./common/common";

import LoginScreen from "./LoginScreen";
import MainScreen from "./MainScreen";
import LandingPage from "./common/LandingPage/LandingPage";
import LogoutUser from "./common/LogoutUser/LogoutUser";
import CreateMarket from "./CreateMarket";
import QueryStreamProvider from "../websocket/queryStream";

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
            <LoginScreen onLogin={handleCredentials} />
          </Route>

          <Route path="/create-market">
            <CreateMarket reconnectThreshold={0} httpBaseUrl={httpBaseUrl} />
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
                  <WellKnownPartiesProvider>
                    <QueryStreamProvider>
                    <PublicProvider>
                      <RegistryLookupProvider>
                        <MainScreen
                          onLogout={() => handleCredentials(undefined)}
                        />
                      </RegistryLookupProvider>
                    </PublicProvider>
                    </QueryStreamProvider>
                  </WellKnownPartiesProvider>
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

const PublicProvider: React.FC = ({ children }) => {
  const { parties, loading } = useDablParties();
  const { party, ledgerId, token } = computeCredentials(parties.publicParty);

  return loading ? (
    <div>Loading...</div>
  ) : (
    <PublicLedger
      ledgerId={ledgerId}
      publicParty={party}
      defaultToken={token}
      httpBaseUrl={httpBaseUrl}
    >
      {children}
    </PublicLedger>
  );
};
export default App;
