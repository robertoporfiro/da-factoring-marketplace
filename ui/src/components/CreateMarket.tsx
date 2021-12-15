
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Form, Button, List, DropdownProps } from "semantic-ui-react";
import { Party, Optional } from '@daml/types';
import Ledger from "@daml/ledger";
import _ from "lodash"
import { retrieveParties } from "./Parties"
import { FactoringOperator, SellerInvitation, BuyerInvitation } from "@daml.js/daml-factoring/lib/Factoring/Onboarding";
import { wrapDamlTuple } from "./common/damlTypes";
import { Buyer } from "@daml.js/daml-factoring/lib/Factoring/Buyer";
import { Broker } from "@daml.js/daml-factoring/lib/Factoring/Broker";
import { BrokerInvitation } from "@daml.js/daml-factoring/lib/Factoring/Broker";
import { OnboardingTile } from './LoginScreen'

import './CreateMarket.scss'
import deployTrigger, {TRIGGER_HASH, MarketplaceTrigger, PublicAutomation, getPublicAutomation} from "../automation";
import { usePublicParty } from "./common/common";
import { PartyToken } from "@daml/hub-react";

export type PartyLogin = {
    party: Party;
    token: string;
}

export type LedgerProps = {
    httpBaseUrl?: string;
    wsBaseUrl?: string;
    reconnectThreshold?: number;
}

function isStringArray(strArr: any): strArr is string[] {
    if (Array.isArray(strArr)) {
        return strArr.reduce((acc, elem) => {
            return acc && typeof elem === 'string'
        }, true);
    } else {
        return false
    }
}

const CreateMarket: React.FC<LedgerProps> = ({ httpBaseUrl, wsBaseUrl, reconnectThreshold }) => {
  const publicParty = usePublicParty();
  const [parties, setParties] = useState<PartyToken[]>([]);

  useEffect(() => {
    if (!!publicParty) {
      console.log("GOT A PUBLIC PARTY: ", publicParty);
      const retrieved = retrieveParties(publicParty) || []
      setParties(retrieved);
    } else {
      console.log("NO PUBLIC PARTY: ", publicParty);
    }
  }, [publicParty])

  const [ didBootstrap, setDidBootstrap ] = useState<boolean>(false);
  const [logItems, setLogItems] = useState<Array<string>>([]);
  const loginMap = new Map<string,PartyToken>(parties.map(obj => [obj.partyName, obj]));
  const partyIdMap = new Map<string,PartyToken>(parties.map(obj => [obj.party, obj]));

  const [ exchangeParty, setExchangeParty ] = useState<Party>();
  const [ csdParty, setCsdParty ] = useState<Party>();
  const [ sellerParties, setSellerParties ] = useState<string[]>([]);
  const [ buyerParties, setBuyerParties ] = useState<string[]>([]);
  const [ brokerParties, setBrokerParties ] = useState<string[]>([]);

  // parties.filter(p => { return p.partyName.includes("Seller") });
  // const buyers = parties.filter(p => { return p.partyName.includes("Buyer") });
  // parties.filter(p => { return p.partyName.includes("Broker") });
  const sellers = sellerParties.map(s => partyIdMap.get(s));
  const buyers = buyerParties.map(b => partyIdMap.get(b));
  const brokers = brokerParties.map(b => {
    return partyIdMap.get(b);
  });


  const history = useHistory();

  const handleSelectSellers = (event: React.SyntheticEvent, result: DropdownProps) => {
      if (typeof result.value === 'string') {
          setSellerParties([...sellerParties, result.value])
      } else if (isStringArray(result.value)) {
          setSellerParties(result.value);
      }
  }

  const handleSelectMultiple = (result: DropdownProps, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
      if (typeof result.value === 'string') {
          setter([...current, result.value])
      } else if (isStringArray(result.value)) {
          setter(result.value);
      }
  }

  const [automations, setAutomations] = useState<PublicAutomation[] | undefined>([]);
  useEffect(() => {
    if (parties.length > 0) {
      const publicParty = loginMap.get('Public').party;
        getPublicAutomation(publicParty).then(autos => { setAutomations(autos) });
        const timer = setInterval(() => {
          getPublicAutomation(publicParty).then(autos => {
            setAutomations(autos);
            if (!!automations && automations.length > 0) {
              clearInterval(timer);
            }
          });
       }, 2000);
      return () => clearInterval(timer);
    }
  }, [parties]);


  const addToLog = (toAdd: string) => {
      setLogItems(logItems => logItems.concat(toAdd));
  }

  const partyOptions = parties
      .map(p => ({
          key: p.party,
          text: p.partyName,
          value: p.party
      }));

  const missingParties = () => {
    console.log(exchangeParty);
    return brokerParties.length <= 0 || sellerParties.length <= 0 || buyerParties.length <= 0 || exchangeParty === "" || csdParty === "";
  }

  const hasDuplicates = () => {
    const array = [...brokerParties, ...sellerParties, ...buyerParties, exchangeParty, csdParty];
    return new Set(array).size !== array.length;
  }


  const handleSetup = async (event: React.FormEvent) => {
      if (loginMap !== undefined) {
        const userAdmin = loginMap.get('UserAdmin');
        // const exchange = loginMap.get('Exchange');
        // const csd = loginMap.get('CSD');
        //
        const exchange = partyIdMap.get(exchangeParty);
        const csd = partyIdMap.get(csdParty);

        const publicParty = loginMap.get('Public').party;
        const adminLedger = new Ledger({token: userAdmin.token, httpBaseUrl, wsBaseUrl, reconnectThreshold})
        const primaryBroker: Optional<Party> = brokers.length > 0 ? brokers[0].party : null;

        addToLog("Onboarding operator...");
        try {
          deployTrigger(TRIGGER_HASH, MarketplaceTrigger.OperatorTrigger, userAdmin.token, publicParty);
          await adminLedger.create(FactoringOperator, {operator: userAdmin.party, public: loginMap.get('Public').party, csd: csd.party, exchange: exchange.party});
        } catch(e) {
          console.log("error exercising setup: " + e);
        }

        addToLog("onboarding parties...");
        const setupMarketArgs = {
          csd: csd.party,
          exchange: exchange.party,
          sellers: sellers.map(s => {return s.party}),
          buyers: buyers.map(b => {return b.party}),
          brokers: brokers.map(b => {return b.party})
        }
        try {
          deployTrigger(TRIGGER_HASH, MarketplaceTrigger.ExchangeTrigger, exchange.token, publicParty);
          deployTrigger(TRIGGER_HASH, MarketplaceTrigger.CSDTrigger, csd.token, publicParty);
          await adminLedger.exerciseByKey(FactoringOperator.FactoringOperator_SetupMarket, userAdmin.party, setupMarketArgs);
        } catch(e) {
          console.log("error exercising setup: " + e);
        }

        addToLog("accepting seller invitations...");
        for (const seller of sellers) {
          addToLog("adding seller: " + seller.partyName);
          const ledger = new Ledger({token: seller.token, httpBaseUrl, wsBaseUrl, reconnectThreshold})
            const args = {
                firstName: seller.partyName,
                lastName: "Seller",
                company: "here",
                email: "seller@seller.com",
                optBroker: primaryBroker,
                optTest: "test",
                isPublic: true }
          try {
            await ledger.exerciseByKey(SellerInvitation.SellerInvitation_Accept, wrapDamlTuple([userAdmin.party, seller.party]), args);
          } catch(e) {
            console.log('error exercising seller' + e);
          }
        };

        addToLog("accepting buyer invitations...");
        for (const buyer of buyers) {
          addToLog("adding buyer: " + buyer.partyName);
          const ledger = new Ledger({token: buyer.token, httpBaseUrl, wsBaseUrl, reconnectThreshold})
          const args = { firstName: buyer.partyName, lastName: "Buyer", company: "company", email: "email", optBroker: primaryBroker, isPublic: true }
          try {
            await ledger.exerciseByKey(BuyerInvitation.BuyerInvitation_Accept, wrapDamlTuple([userAdmin.party, buyer.party]), args);
          } catch(e) {
            console.log('error acepting buyer ' + e);
          }
          try {
            await ledger.exerciseByKey(Buyer.Buyer_RequestDeposit, wrapDamlTuple([userAdmin.party, buyer.party]), { amount: "10000000.0" });
          } catch(e) {
            console.log('error requesting deposit ' + e);
          }
        }

        addToLog("accepting broker invitations...");
        for (const broker of brokers) {
          const ledger = new Ledger({token: broker.token, httpBaseUrl, wsBaseUrl, reconnectThreshold})
            const args = {
                firstName: broker.partyName,
                lastName: "Broker",
                email: `${broker.partyName}@broker.com`,
                company: "The Brokerage",
                isPublic: true
            }
          try {
            deployTrigger(TRIGGER_HASH, MarketplaceTrigger.BrokerTrigger, broker.token, publicParty);
            await ledger.exerciseByKey(BrokerInvitation.BrokerInvitation_Accept, wrapDamlTuple([userAdmin.party, broker.party]), args);
          } catch(e) {
           console.log('error acepting broker ' + e);
          }
          try {
            await ledger.exerciseByKey(Broker.Broker_RequestDeposit, wrapDamlTuple([userAdmin.party, broker.party]), { amount: "10000000.0" });
          } catch(e) {
            console.log('error requesting deposit ' + e);
          }
        }

        addToLog("done!");
        setDidBootstrap(true);
      }
  };

  const boostrapForm = (
    <>
      { !!!loginMap.get('UserAdmin') && <p>Please add a UserAdmin!</p> }
      <Form size="large" className="test-select-login-screen">
        { !didBootstrap ? (<>
          <Form.Select
            clearable
            label={<p>Exchange</p>}
            value={exchangeParty}
            placeholder='Select Exchange...'
            options={partyOptions}
            onChange={(_, result) => setExchangeParty(result.value as string)}/>
          <Form.Select
            clearable
            label={<p>CSD</p>}
            value={csdParty}
            placeholder='Select CSD...'
            options={partyOptions}
            onChange={(_, result) => setCsdParty(result.value as string)}/>
          <Form.Select
            placeholder='Select...'
            multiple
            label={<p>Buyers</p>}
            disabled={partyOptions.length === 0}
            options={partyOptions}
            onChange={(_,result) => handleSelectMultiple(result, buyerParties, setBuyerParties) }/>
          <Form.Select
            placeholder='Select...'
            multiple
            label={<p>Sellers</p>}
            disabled={partyOptions.length === 0}
            options={partyOptions}
            onChange={(_,result) => handleSelectMultiple(result, sellerParties, setSellerParties) }/>
          <Form.Select
            placeholder='Select...'
            multiple
            label={<p>Brokers</p>}
            disabled={partyOptions.length === 0}
            options={partyOptions}
            onChange={(_,result) => handleSelectMultiple(result, brokerParties, setBrokerParties) }/>
          { missingParties() ? <p> All parties must be selected </p> : !hasDuplicates() ? (
            <Button
              primary
              fluid
              className="test-select-login-button"
              content="Go!"
              onClick={handleSetup}
            />
          ) : ( <p>Parties must not play multiple roles!</p>
          )}
      </>
        ) : (
            <Button
              primary
              fluid
              className="test-select-login-butt"
              content="Return to login"
              onClick={() => history.push("/login")}/>
        )}
      </Form>
      <List items={logItems}/>
    </>
  )


  return (
      <div className="login-screen">
        <OnboardingTile subtitle='Create sample market'>
          { automations.length == 0 ? <p>Please make triggers deployable</p> : boostrapForm }
        </OnboardingTile>
      </div>
  );
};

export default CreateMarket;
