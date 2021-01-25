import React from "react";
import AuctionsView from "../../common/Auctions/AuctionsView";
import { FactoringRole } from "../../common/FactoringRole";

import BrokerRoutes from "../BrokerRoutes";

const BrokerBuyers: React.FC = () => (
  <AuctionsView
    activeRoute="Buyers"
    routes={BrokerRoutes}
    userRole={FactoringRole.Broker}
  />
);

export default BrokerBuyers;
