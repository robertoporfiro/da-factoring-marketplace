
  // const ledger = useMemo(() => new Ledger({token, httpBaseUrl, wsBaseUrl, reconnectThreshold}), [token, httpBaseUrl, wsBaseUrl, reconnectThreshold]);

import React, {useState, useMemo} from "react";
import {useHistory} from "react-router-dom";
import {computeCredentials} from "./Credentials";
import {Form, Button, List} from "semantic-ui-react";
import { ContractId,Party, Template} from '@daml/types';
import Ledger from "@daml/ledger";
import {Parties, PartyDetails, retrieveParties} from "./Parties"
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
  const loginMap = new Map<string,PartyDetails>(logins.map(obj => [obj.partyName, obj]));
  // const loginMap = logins?.reduce((map, obj) => {
  //     map[obj.partyName] = obj
  //     return map;
  // }, {});

  const addToLog = (toAdd: string) => {
      setLogItems(logItems => logItems.concat(toAdd));
  }


  const history = useHistory();

  const handleLogin = async (event: React.FormEvent) => {
      if (loginMap !== undefined) {
          const userAdmin = loginMap.get('UserAdmin');
          const ledger = new Ledger({token: userAdmin.token, httpBaseUrl, wsBaseUrl, reconnectThreshold})
          addToLog("Creating market...");
          await ledger.create(Operator, {operator: userAdmin.party, public: loginMap.get('Public').party});
          addToLog("onboarding exchange...");
          await ledger.exerciseByKey(Operator.Operator_OnboardExchange, userAdmin.party, {exchange: loginMap.get('Exchange').party});
          addToLog("done!");
      }
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
