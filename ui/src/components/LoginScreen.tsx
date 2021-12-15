// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button, Form, Popup, Icon, Divider } from "semantic-ui-react";
import { Grid, Header } from "semantic-ui-react";

import Credentials, { computeCredentials } from "../Credentials";
import { retrieveParties, storeParties } from './Parties'
import { AppError } from './common/errorTypes'
import FormErrorHandled from './common/FormErrorHandled'
import { ledgerId } from "../config";
import { DamlHubLogin, isRunningOnHub, PartyToken } from "@daml/hub-react";
import { usePublicParty } from "./common/common";

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
    return !isRunningOnHub() ? localLogin : dablLogin;
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

  const history = useHistory();

  const handleDablTokenLogin = () => {
    onLogin({ token: jwt, party: partyId, ledgerId });
    history.push("/role");
  };

  return (
    <>
      <Form size="large" className="login-button">
        <DamlHubLogin
          onLogin={creds => {
            onLogin(creds)
          }}
          options={{
            method: {
                button: {
                    render: () => <Button
                        fluid
                        icon='right arrow blue'
                        labelPosition='right'
                        className='dabl-login-button'
                    />
                }
            }
        }}/>
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
          className='white-button'
          onClick={handleDablTokenLogin}
        />
      </Form>
    </>
  );
};

const PartiesLoginForm: React.FC<Props> = ({onLogin}) => {
  const [ selectedPartyId, setSelectedPartyId ] = useState('');
  const [ parties, setParties ] = useState<PartyToken[]>();

  const publicParty = usePublicParty();
  const history = useHistory();

  const options = parties?.map(party => ({
    key: party.party,
    text: party.partyName,
    value: party.party
  })) || [];

  useEffect(() => {
    if (!!publicParty) {
      const parties = retrieveParties(publicParty);
      if (parties) {
        setParties(parties);
        setSelectedPartyId(parties.find(_ => true)?.party || '');
      }
    }
  }, [publicParty]);

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

  const handleLoad = async (parties: PartyToken[]) => {
      if (parties.length > 0) {
          setParties(parties)
          setSelectedPartyId(parties[0].party)
          storeParties(parties)
      }
  }

  const handleError = (error: string): (() => Promise<void>) => {
      return async () => {
          throw new AppError("Invalid Parties.json", error)
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
                <DamlHubLogin withFile
                    options={{
                        method: {
                            file: {
                                render: () => (
                                    <label className='custom-file-upload button ui'>
                                        <Icon name='file' className='white' />
                                        <p className='dark'>Load Parties</p>
                                    </label>
                                )

                            }
                        }
                    }}
                    onPartiesLoad={(creds, err) => {
                        if (creds) {
                            handleLoad(creds)
                        } else {
                            loadAndCatch(handleError(err || 'Parties login error'))
                        }
                    }}
                />
              </Form.Input>
            </Form.Group>
            <Button
              fluid
              submit
              disabled={!parties?.find(p => p.party === selectedPartyId)}
              className='white-button'
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
