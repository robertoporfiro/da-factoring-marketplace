import React from "react";

import AuctionsView from "../../common/Auctions/AuctionsView";
import { FactoringRole } from "../../common/FactoringRole";
import ExchangeRoutes from "../ExchangeRoutes";

import "./Auctions.css";

const ExchangeAuctions: React.FC = () => {
  return (
    <AuctionsView
      userRole={FactoringRole.Exchange}
      routes={ExchangeRoutes}
      showSortSelector={false}
      activeRoute="Auctions"
    />
  );
};

export default ExchangeAuctions;
