// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import {
  Switch,
  Route,
  useRouteMatch,
  useHistory,
  Redirect,
} from "react-router-dom";

import { useDablParties } from "./common/common";

import SellerInvoices from "./Seller/Invoices/Invoices";
import BuyerAuctions from "./Buyer/Auctions/Auctions";
import BuyerPlaceBid from "./Buyer/PlaceBid/PlaceBid";
import BrokerMyUsers from "./Broker/MyUsers/MyUsers";
import BrokerInvoices from "./Broker/Invoices/Invoices";
import { useParty, useQuery, useStreamQueries } from "@daml/react";
import { Seller } from "@daml.js/da-marketplace/lib/Factoring/Seller";
import { Buyer } from "@daml.js/da-marketplace/lib/Factoring/Buyer";
import { Exchange } from "@daml.js/da-marketplace/lib/Marketplace/Exchange";
import { FactoringRole } from "./common/FactoringRole";
import { Custodian } from "@daml.js/da-marketplace/lib/Marketplace/Custodian";
import CSDAuctions from "./CSD/Auctions/Auctions";
import ExchangeAllUsers from "./Exchange/AllUsers/AllUsers";
import BrokerSellers from "./Broker/Sellers/Sellers";
import BrokerBuyers from "./Broker/Buyers/Buyers";
import TermsAndConditions from "./TermsAndConditions/TermsAndConditions";

type Props = {
  onLogout: () => void;
};

/**
 * React component for the main screen of the `App`.
 */

const MainScreen: React.FC<Props> = ({ onLogout }) => {
  const history = useHistory();
  const [role, setRole] = useState<FactoringRole>();
  const { path } = useRouteMatch();
  const party = useParty();

  const sellerContracts = useQuery(Seller).contracts;

  const buyerContracts = useQuery(Buyer).contracts;

  const exchangeContracts = useQuery(Exchange).contracts;

  const custodianContracts = useQuery(Custodian).contracts;
  console.log(path);
  useEffect(() => {
    if (role !== undefined) {
      history.push(`${path}/${role.toLowerCase()}`);
    }
  }, [history, path, role]);

  useEffect(() => {
    if (party === "CSD") {
      setRole(FactoringRole.CSD);
    } else if (party === "Broker") {
      setRole(FactoringRole.Broker);
    } else if (sellerContracts.length > 0) {
      setRole(FactoringRole.Seller);
    } else if (buyerContracts.length > 0) {
      setRole(FactoringRole.Buyer);
    } else if (exchangeContracts.length > 0) {
      setRole(FactoringRole.Exchange);
    } else if (custodianContracts.length > 0) {
      setRole(FactoringRole.CSD);
    }
  }, [
    sellerContracts,
    buyerContracts,
    exchangeContracts,
    custodianContracts,
    party,
  ]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        Loading...
      </Route>
      <Route path={`${path}/exchange`}>
        <ExchangeAllUsers />
      </Route>
      <Route path={`${path}/csd`}>
        <CSDAuctions />
      </Route>
      <Route path={`${path}/seller`}>
        <SellerInvoices />
      </Route>
      <Route exact path={`${path}/buyer`}>
        <BuyerAuctions />
      </Route>
      <Route path={`${path}/buyer/placebid/:auctionContractId`}>
        <BuyerPlaceBid />
      </Route>
      <Route exact path={`${path}/broker/`}>
        <Redirect to={`${path}/broker/users`} />
      </Route>
      <Route path={`${path}/broker/users`}>
        <BrokerMyUsers />
      </Route>
      <Route path={`${path}/broker/invoices`}>
        <BrokerInvoices />
      </Route>
      <Route path={`${path}/broker/sellers`}>
        <BrokerSellers />
      </Route>
      <Route path={`${path}/broker/buyers`}>
        <BrokerBuyers />
      </Route>
    </Switch>

    /*
    <Switch>
      <Route exact path={path}>
        { loading || !parties
          ? loadingScreen
          : error ? errorScreen : <RoleSelectScreen operator={parties.userAdminParty} onLogout={onLogout}/>
        }
      </Route>

      <Route path={`${path}/investor`}>
        <Investor onLogout={onLogout}/>
      </Route>

      <Route path={`${path}/issuer`}>
        <Issuer onLogout={onLogout}/>
      </Route>

      <Route path={`${path}/exchange`}>
        <Exchange onLogout={onLogout}/>
      </Route>

      <Route path={`${path}/custodian`}>
        <Custodian onLogout={onLogout}/>
      </Route>

      <Route path={`${path}/broker`}>
        <Broker onLogout={onLogout}/>
      </Route>
    </Switch>
    */
  );
};

export default MainScreen;
