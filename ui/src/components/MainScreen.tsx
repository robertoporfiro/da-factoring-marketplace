// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";

import { useDablParties } from "./common/common";
import { parseError } from "./common/errorTypes";
import OnboardingTile from "./common/OnboardingTile";

import RoleSelectScreen from "./RoleSelectScreen";
import Investor from "./Investor/Investor";
import Issuer from "./Issuer/Issuer";
import Exchange from "./Exchange/Exchange";
import Custodian from "./Custodian/Custodian";
import Broker from "./Broker/Broker";
import SellerInvoices from "./Seller/Invoices/Invoices";
import BuyerAuctions from "./Buyer/Auctions/Auctions";
import BuyerPlaceBid from "./Buyer/PlaceBid/PlaceBid";
import BrokerMyUsers from "./Broker/MyUsers/MyUsers";
import BrokerInvoices from "./Broker/Invoices/Invoices";

type Props = {
  onLogout: () => void;
};

/**
 * React component for the main screen of the `App`.
 */
const MainScreen: React.FC<Props> = ({ onLogout }) => {
  const { path } = useRouteMatch();
  const { parties, loading, error } = useDablParties();

  const loadingScreen = <OnboardingTile>Loading...</OnboardingTile>;
  const errorScreen = error && (
    <OnboardingTile>
      <div>{parseError(error)?.message}</div>
    </OnboardingTile>
  );

  return (
    <Switch>
      <Route exact path={path}>
        <SellerInvoices />
      </Route>
      <Route path={`${path}/buyer/auctions`}>
        <BuyerAuctions />
      </Route>
      <Route path={`${path}/buyer/placebid`}>
        <BuyerPlaceBid />
      </Route>
      <Route path={`${path}/broker/users`}>
        <BrokerMyUsers />
      </Route>
      <Route path={`${path}/broker/invoices`}>
        <BrokerInvoices />
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
