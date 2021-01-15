
  // const ledger = useMemo(() => new Ledger({token, httpBaseUrl, wsBaseUrl, reconnectThreshold}), [token, httpBaseUrl, wsBaseUrl, reconnectThreshold]);

import React, {useState, useMemo} from "react";
import {useHistory} from "react-router-dom";
import {computeCredentials} from "./Credentials";
import {Form, Button, List} from "semantic-ui-react";
import { ContractId,Party, Template} from '@daml/types';
import Ledger from "@daml/ledger";
import {Parties, retrieveParties} from "./Parties"
import {Operator} from "@daml.js/da-marketplace/lib/Marketplace/Operator";

type CreateMarketProps = {
  subtitle?: string;
};

export type PartyLogin = {
    party: Party;
    token: string;
}

export type LedgerProps = {
    httpBaseUrl?: string;
    wsBaseUrl?: string;
    reconnectThreshold?: number;
}

const CreateMarket: React.FC<LedgerProps> = ({ httpBaseUrl, wsBaseUrl, reconnectThreshold }) => {
  const logins = retrieveParties();
  const [logItems, setLogItems] = useState<Array<string>>([]);
  const loginMap = logins.reduce((map, obj) => {
      map[obj.partyName] = obj
      return map;
  });

  const addToLog = (toAdd: string) => {
      setLogItems(logItems => logItems.concat(toAdd));
  }

  const userAdmin = loginMap['UserAdmin'];

  const history = useHistory();
  const ledger = new Ledger({token: userAdmin.token, httpBaseUrl, wsBaseUrl, reconnectThreshold})

  const handleLogin = async (event: React.FormEvent) => {
      addToLog("Creating market...");
      await ledger.create(Operator, {operator: userAdmin.party, public: loginMap['Public'].party});
      addToLog("onboarding exchange...");
      await ledger.exerciseByKey(Operator.Operator_OnboardExchange, userAdmin.party, {exchange: loginMap['Exchange'].party});
      addToLog("onboarding issuer...");
      await ledger.exerciseByKey(Operator.Operator_OnboardIssuer, userAdmin.party, {issuer: loginMap['Exchange'].party});
      addToLog("onboarding thing...");
      await ledger.exerciseByKey(Operator.Operator_OnboardBroker, userAdmin.party, {broker: loginMap['Exchange'].party});
      addToLog("onboarding next...");
      await ledger.exerciseByKey(Operator.Operator_OnboardInvestor, userAdmin.party, {investor: loginMap['Exchange'].party});
      addToLog("done!");
  };

  return (
    <>
      <Form size="large" className="test-select-login-screen">
        <Button
          primary
          fluid
          className="test-select-login-button"
          content="Go!"
          onClick={handleLogin}
        />
      </Form>
      <List items={logItems}/>
    </>
  );
};

export default CreateMarket;
