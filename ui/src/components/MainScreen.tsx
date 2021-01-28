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
import {
  useParty,
  useQuery,
  useStreamQueries,
  useStreamQuery,
} from "@daml/react";
import { Seller } from "@daml.js/da-marketplace/lib/Factoring/Seller";
import { Buyer } from "@daml.js/da-marketplace/lib/Factoring/Buyer";
import { Exchange } from "@daml.js/da-marketplace/lib/Marketplace/Exchange";
import { FactoringRole } from "./common/FactoringRole";
import { Custodian } from "@daml.js/da-marketplace/lib/Marketplace/Custodian";
import CSDAuctions from "./CSD/Auctions/Auctions";
import ExchangeAllUsers from "./Exchange/AllUsers/AllUsers";
import BrokerSellers from "./Broker/Sellers/Sellers";
import BrokerBuyers from "./Broker/Buyers/Buyers";
import ExchangeDashboard from "./Exchange/Dashboard/Dashboard";
import CSDDashboard from "./CSD/Dashboard/Dashboard";
import OnboardUser from "./OnboardUser/OnboardUser";
import { RegisteredUser } from "@daml.js/da-marketplace/lib/Factoring/Registry";
import ProfilePage from "./common/ProfilePage/ProfilePage";
import { LogoutUser } from "./common/LogoutUser/LogoutUser";

type Props = {
  onLogout: () => void;
};

/**
 * React component for the main screen of the `App`.
 */

const MainScreen: React.FC<Props> = ({ onLogout }) => {
  const history = useHistory();
  const { path } = useRouteMatch();
  const [role, setRole] = useState<FactoringRole>();
  const [user, setUser] = useState<RegisteredUser>();
  const [roleFetched, setRoleFetched] = useState(false);
  const party = useParty();

  const userContracts = useStreamQueries(RegisteredUser).contracts;

  const sellerContracts = useStreamQueries(Seller).contracts;

  const buyerContracts = useStreamQueries(Buyer).contracts;

  const exchangeContracts = useStreamQueries(Exchange).contracts;

  const custodianContracts = useStreamQueries(Custodian).contracts;

  console.log(path);
  useEffect(() => {
    const userPayload = userContracts[0]?.payload;
    if (userPayload) {
      setUser(userPayload);
    }
  }, [userContracts]);
  useEffect(() => {
    if (role !== undefined && !roleFetched) {
      history.push(`${path}/${role.toLowerCase()}`);
      setRoleFetched(true);
    }
  }, [history, path, role, roleFetched]);

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
        <OnboardUser />
      </Route>
      <Route exact path={`/logout`}>
        <LogoutUser onLogout={onLogout} />
      </Route>
      <Route exact path={`${path}/profile`}>
        <ProfilePage />
      </Route>
      <Route exact path={`${path}/exchange/`}>
        <Redirect to={`${path}/exchange/dashboard`} />
      </Route>
      <Route path={`${path}/exchange/dashboard`}>
        <ExchangeDashboard />
      </Route>
      <Route path={`${path}/exchange/users`}>
        <ExchangeAllUsers />
      </Route>
      <Route exact path={`${path}/csd/`}>
        <Redirect to={`${path}/csd/dashboard`} />
      </Route>
      <Route path={`${path}/csd/dashboard`}>
        <CSDDashboard />
      </Route>
      <Route path={`${path}/csd/auctions`}>
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
