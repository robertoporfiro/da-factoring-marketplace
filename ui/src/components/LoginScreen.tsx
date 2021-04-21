// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Button, Form, Popup, Icon, Divider } from "semantic-ui-react";
import { Grid, Header } from "semantic-ui-react";

import Credentials, { computeCredentials } from "../Credentials";
import { Parties, retrieveParties, storeParties } from './Parties'
import { AppError, InvalidPartiesJSONError } from './common/errorTypes'
import FormErrorHandled from './common/FormErrorHandled'
import {
  DeploymentMode,
  deploymentMode,
  ledgerId,
  dablHostname
} from "../config";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function getTokenFromCookie(): string {
  const tokenCookiePair =
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("DABL_LEDGER_ACCESS_TOKEN")) || "";
  return tokenCookiePair.slice(tokenCookiePair.indexOf("=") + 1);
}

type Props = {
  onLogin: (credentials: Credentials) => void;
};

type OnboardingTileProps = {
  subtitle?: string;
};

export const OnboardingTile: React.FC<OnboardingTileProps> = ({
  children,
  subtitle,
}) => {
  return (
    <Grid className="onboarding-tile" textAlign="center" verticalAlign="middle">
      <Grid.Row>
        <Grid.Column width={8} className="onboarding-tile-content">
          <Header as="h3" textAlign="center">
            <Header.Content></Header.Content>
          </Header>
          <p> {subtitle} </p>
          {children}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

/**
 * React component for the login screen of the `App`.
 */
const LoginScreen: React.FC<Props> = ({ onLogin }) => {
    const localLogin = (
      <div className="login-screen">
        <OnboardingTile>
          <LocalLoginForm onLogin={onLogin} />
        </OnboardingTile>
      </div>
    );
    const dablLogin = (
      <div className="login-screen">
        <OnboardingTile>
          <DablLoginForm onLogin={onLogin} />
        </OnboardingTile>
        <OnboardingTile subtitle="Login with parties.json">
          <PartiesLoginForm onLogin={onLogin} />
        </OnboardingTile>
      </div>
    )
    return deploymentMode !== DeploymentMode.PROD_DABL ? localLogin : dablLogin;
};

const LocalLoginForm: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const history = useHistory();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const credentials = computeCredentials(username);
    onLogin(credentials);
    history.push("/role");
  };

  return (
    <Form size="large" className="test-select-login-screen">
      {/* FORM_BEGIN */}
      <Form.Input
        centered
        required
        basic
        icon="user"
        iconPosition="left"
        placeholder="Username"
        value={username}
        className="test-select-username-field"
        onChange={(e) => setUsername(e.currentTarget.value)}
      />
      <Button
        fluid
        disabled={!username}
        content="Log in"
        onClick={handleLogin}
      />
      {/* FORM_END */}
    </Form>
  );
};

const DablLoginForm: React.FC<Props> = ({ onLogin }) => {
  const [partyId, setPartyId] = useState("");
  const [jwt, setJwt] = useState("");

  const query = useQuery();
  const history = useHistory();
  const location = window.location;

  const handleDablLogin = () => {
    window.location.assign(
      `https://login.${dablHostname}/auth/login?ledgerId=${ledgerId}`
    );
  };

  const handleDablTokenLogin = () => {
    onLogin({ token: jwt, party: partyId, ledgerId });
    history.push("/role");
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    console.log(url);

    // When DABL login redirects back to app, hoist the query into the hash route.
    // This allows react-router's HashRouter to see and parse the supplied params

    // i.e., we want to turn
    // ledgerid.projectdabl.com/?party=party&token=token/#/
    // into
    // ledgerid.projectdabl.com/#/?party=party&token=token
    if (url.search !== "" && url.hash === "#/") {
      window.location.href = `${url.origin}${url.pathname}#/login/${url.search}`;
    }
  }, [location]);

  useEffect(() => {
    const party = query.get("party");
    const token = query.get("token");
    // const token = getTokenFromCookie();

    if (!token || !party) {
      return;
    }

    onLogin({ token, party, ledgerId });
    history.push("/role");
  }, [onLogin, query, history]);

  return (
    <>
      <Form size="large" className="login-button">
        <Button
          primary
          fluid
          className="button"
          content="Log in with DABL"
          onClick={handleDablLogin}
        />
      </Form>
      <p>Or</p>
      <Form size="large" className="test-select-login-screen">
        <Form.Input
          fluid
          required
          icon="user"
          iconPosition="left"
          label="Party"
          placeholder="Party ID"
          value={partyId}
          className="test-select-username-field"
          onChange={(e) => setPartyId(e.currentTarget.value)}
        />

        <Form.Input
          fluid
          required
          icon="lock"
          type="password"
          iconPosition="left"
          label="Token"
          placeholder="Party JWT"
          value={jwt}
          className="test-select-username-field"
          onChange={(e) => setJwt(e.currentTarget.value)}
        />

        <Button
          fluid
          disabled={!jwt || !partyId}
          content="Submit"
          onClick={handleDablTokenLogin}
        />
      </Form>
    </>
  );
};

const PartiesLoginForm: React.FC<Props> = ({onLogin}) => {
  const [ selectedPartyId, setSelectedPartyId ] = useState('');
  const [ parties, setParties ] = useState<Parties>();

  const history = useHistory();

  const options = parties?.map(party => ({
    key: party.party,
    text: party.partyName,
    value: party.party
  })) || [];

  useEffect(() => {
    const parties = retrieveParties();
    if (parties) {
      setParties(parties);
      setSelectedPartyId(parties.find(_ => true)?.party || '');
    }
  }, []);

  const handleLogin = async () => {
    const partyDetails = parties?.find(p => p.party === selectedPartyId);

    if (partyDetails) {
      const { ledgerId, party, token } = partyDetails;
      onLogin({ ledgerId, party, token });
      history.push('/role');
    } else {
      throw new AppError("Failed to Login", "No parties.json or party selected");
    }
  }

  const handleFileUpload = async (contents: string) => {
    try {
      storeParties(JSON.parse(contents));
      const parties = retrieveParties();

      if (parties) {
        setParties(parties);
        setSelectedPartyId(parties.find(_ => true)?.party || '');
      }
    } catch (err) {
      if (err instanceof InvalidPartiesJSONError) {
        throw err;
      } else {
        throw new InvalidPartiesJSONError("Not a JSON file or wrongly formatted JSON.")
      }
    }
  }

  return (
    <>
      <p>
        <span>Alternatively, login with <code className='link'>parties.json</code> </span>
        <Popup
          trigger={<Icon name='info circle'></Icon>}
          content='Located in the DABL Console Users tab'/>
      </p>
      <FormErrorHandled size='large' className='parties-login' onSubmit={handleLogin}>
        { loadAndCatch => (
          <>
            <Form.Group widths='equal'>
              <Form.Select
                selection
                label='Party Name'
                placeholder='Choose a party'
                options={options}
                value={selectedPartyId}
                onChange={(_, d) => typeof d.value === 'string' && setSelectedPartyId(d.value)}/>

              <Form.Input className='upload-file-input'>
                <label className="custom-file-upload button secondary ui">
                  <input type='file' value='' onChange={e => {
                    const reader = new FileReader();

                    reader.onload = function(event) {
                      loadAndCatch(async () => {
                        if (event.target && typeof event.target.result === 'string') {
                          await handleFileUpload(event.target.result);
                        }
                      })
                    };

                    if (e.target && e.target.files) {
                      reader.readAsText(e.target.files[0]);
                    }
                  }}/>
                  <Icon name='file'/><span>Load Parties</span>
                </label>
              </Form.Input>
            </Form.Group>
            <Button
              fluid
              submit
              disabled={!parties?.find(p => p.party === selectedPartyId)}
              className='test-select-login-button'
              content='Log in'/>
            {/* FORM_END */}
            <Divider horizontal/>
            <Button
              fluid
              primary
              onClick={() => history.push('create-market')}
              disabled={!parties}
              content='Bootstrap Market Data'/>
          </>
        )}
      </FormErrorHandled>
    </>
  )
}

export default LoginScreen;
