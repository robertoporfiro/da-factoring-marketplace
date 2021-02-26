// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { PropsWithChildren, useEffect, useState } from "react";
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
import BidsView from "./common/Auctions/BidsView/BidsView";
import BrokerMyUsers from "./Broker/MyUsers/MyUsers";
import BrokerInvoices from "./Broker/Invoices/Invoices";
import {
  useParty,
  useQuery,
  useStreamQueries,
  useStreamQuery,
} from "@daml/react";
import { Broker } from "@daml.js/daml-factoring/lib/Factoring/Broker";
import { Seller } from "@daml.js/daml-factoring/lib/Factoring/Seller";
import { Buyer } from "@daml.js/daml-factoring/lib/Factoring/Buyer";
import { Exchange } from "@daml.js/daml-factoring/lib/Marketplace/Exchange";
import { FactoringRole } from "./common/FactoringRole";
import { Custodian } from "@daml.js/daml-factoring/lib/Marketplace/Custodian";
import CSDAuctions from "./CSD/Auctions/Auctions";
import ExchangeAllUsers from "./Exchange/AllUsers/AllUsers";
import BrokerSellers from "./Broker/Sellers/Sellers";
import BrokerBuyers from "./Broker/Buyers/Buyers";
import ExchangeDashboard from "./Exchange/Dashboard/Dashboard";
import CSDDashboard from "./CSD/Dashboard/Dashboard";
import OnboardUser from "./OnboardUser/OnboardUser";
import {
  RegisteredBuyer,
  RegisteredSeller,
  RegisteredUser,
} from "@daml.js/daml-factoring/lib/Factoring/Registry";
import ProfilePage from "./common/ProfilePage/ProfilePage";
import { LogoutUser } from "./common/LogoutUser/LogoutUser";
import ExchangeAuctions from "./Exchange/Auctions/Auctions";
import BrokerAuctions from "./Broker/Auctions/Auctions";

interface MainScreenProps {
  onLogout: () => void;
}

/**
 * React component for the main screen of the `App`.
 */

const MainScreen: React.FC<MainScreenProps> = (props) => {
  const { onLogout } = props;
  const history = useHistory();
  const { path } = useRouteMatch();
  const [role, setRole] = useState<FactoringRole>();
  const [user, setUser] = useState<RegisteredUser>();
  const [roleFetched, setRoleFetched] = useState(false);
  const party = useParty();

  const userContracts = useStreamQueries(RegisteredUser).contracts;
  const brokerContracts = useStreamQueries(Broker).contracts;
  const sellerContracts = useStreamQueries(Seller).contracts;
  const buyerContracts = useStreamQueries(Buyer).contracts;
  const exchangeContracts = useStreamQueries(Exchange).contracts;
  const custodianContracts = useStreamQueries(Custodian).contracts;

  useEffect(() => {
    const userPayload = userContracts[0]?.payload;
    if (userPayload) {
      setUser(userPayload);
    }
  }, [userContracts]);

  useEffect(() => {
    if (role !== undefined && !roleFetched) {
      history.push(`${path}/${role.toLowerCase()}`);
      /*
      if (
        role !== FactoringRole.Exchange &&
        role !== FactoringRole.CSD &&
        role !== FactoringRole.Broker
      ) {
        setRoleFetched(true);
      }
      */
    }
    document.title = role !== undefined ? `Factoring - ${role}` : "Factoring";
  }, [history, path, role, roleFetched]);

  useEffect(() => {
    if (custodianContracts.length > 0) {
      setRole(FactoringRole.CSD);
    } else if (brokerContracts.length > 0) {
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
    brokerContracts,
    party,
  ]);

  const exchangeUser: Partial<RegisteredUser> = {
    firstName: "Exchange",
    roles: ["ExchangeRole"],
  };
  const csdUser: Partial<RegisteredUser> = {
    firstName: "CSD",
    roles: ["CSDRole"],
  };

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <OnboardUser />
      </Route>
      <Route exact path={`/logout`}>
        <LogoutUser onLogout={onLogout} />
      </Route>
      <Route exact path={`${path}/profile`}>
        <ProfilePage user={user} />
      </Route>
      <Route exact path={`${path}/exchange/`}>
        <Redirect to={`${path}/exchange/dashboard`} />
      </Route>
      <Route path={`${path}/exchange/dashboard`}>
        <ExchangeDashboard user={exchangeUser} />
      </Route>
      <Route path={`${path}/exchange/users`}>
        <ExchangeAllUsers user={exchangeUser} />
      </Route>
      <Route exact path={`${path}/exchange/auctions`}>
        <ExchangeAuctions user={exchangeUser} />
      </Route>
      <Route path={`${path}/exchange/auctions/:auctionContractId`}>
        <BidsView
          user={exchangeUser}
          historicalView={true}
          userRole={FactoringRole.Exchange}
        />
      </Route>
      <Route exact path={`${path}/csd/`}>
        <Redirect to={`${path}/csd/dashboard`} />
      </Route>
      <Route path={`${path}/csd/dashboard`}>
        <CSDDashboard user={csdUser} />
      </Route>
      <Route exact path={`${path}/csd/auctions`}>
        <CSDAuctions user={csdUser} />
      </Route>
      <Route path={`${path}/csd/auctions/:auctionContractId`}>
        <BidsView
          user={csdUser}
          historicalView={true}
          userRole={FactoringRole.CSD}
        />
      </Route>
      <Route exact path={`${path}/seller`}>
        <Redirect to={`${path}/seller/invoices`} />
      </Route>
      <Route exact path={`${path}/seller/invoices`}>
        <SellerInvoices user={user} />
      </Route>
      <Route path={`${path}/seller/auctions/:auctionContractId`}>
        <BidsView
          user={user}
          userRole={FactoringRole.Seller}
          historicalView={true}
        />
      </Route>
      <Route exact path={`${path}/buyer/`}>
        <Redirect to={`${path}/buyer/auctions`} />
      </Route>
      <Route exact path={`${path}/buyer/auctions`}>
        <BuyerAuctions user={user} />
      </Route>
      <Route path={`${path}/buyer/auctions/:auctionContractId`}>
        <BidsView user={user} userRole={FactoringRole.Buyer} />
      </Route>
      <Route exact path={`${path}/broker/`}>
        <Redirect to={`${path}/broker/users`} />
      </Route>
      <Route path={`${path}/broker/users`}>
        <BrokerMyUsers user={user} />
      </Route>
      <Route path={`${path}/broker/viewauctions`}>
        <BrokerAuctions user={user} />
      </Route>
      <Route path={`${path}/broker/invoices`}>
        <BrokerInvoices user={user} />
      </Route>
      <Route exact path={`${path}/broker/sellers`}>
        <BrokerSellers user={user} />
      </Route>
      <Route exact path={`${path}/broker/auctions/:auctionContractId`}>
        <BidsView user={user} userRole={FactoringRole.Broker} />
      </Route>
      <Route path={`${path}/broker/buyers`}>
        <BrokerBuyers user={user} />
      </Route>
    </Switch>
  );

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
};

export default MainScreen;
