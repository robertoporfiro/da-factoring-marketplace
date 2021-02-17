import React from "react";
import { IBasePageProps } from "../../BasePage/BasePage";
import AuctionsView from "../../common/Auctions/AuctionsView/AuctionsView";
import { FactoringRole } from "../../common/FactoringRole";

import BrokerRoutes from "../BrokerRoutes";

const BrokerAuctions: React.FC<IBasePageProps> = (props) => (
  <AuctionsView
    activeRoute="Auctions"
    routes={BrokerRoutes}
    userRole={FactoringRole.Broker}
    {...props}
  />
);

export default BrokerAuctions;
