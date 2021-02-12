import React from "react";
import { IBasePageProps } from "../../BasePage/BasePage";
import AuctionsView from "../../common/Auctions/AuctionsView/AuctionsView";
import { FactoringRole } from "../../common/FactoringRole";

import BrokerRoutes from "../BrokerRoutes";

const BrokerBuyers: React.FC<IBasePageProps> = (props) => (
  <AuctionsView
    activeRoute="Buyers"
    routes={BrokerRoutes}
    userRole={FactoringRole.Broker}
    {...props}
  />
);

export default BrokerBuyers;
