import React from "react";
import { IBasePageProps } from "../../BasePage/BasePage";

import AuctionsView from "../../common/Auctions/AuctionsView/AuctionsView";
import { FactoringRole } from "../../common/FactoringRole";
import ExchangeRoutes from "../ExchangeRoutes";

import "./Auctions.scss";

const ExchangeAuctions: React.FC<IBasePageProps> = (props) => {
  return (
    <AuctionsView
      userRole={FactoringRole.Exchange}
      routes={ExchangeRoutes}
      showSortSelector={true}
      activeRoute="Auctions"
      {...props}
    />
  );
};

export default ExchangeAuctions;
