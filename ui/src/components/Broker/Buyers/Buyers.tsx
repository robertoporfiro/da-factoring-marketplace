import React from "react";
import AuctionsView from "../../common/Auctions/AuctionsView";

import BrokerRoutes from "../BrokerRoutes";

const BrokerBuyers: React.FC = () => (
  <AuctionsView activeRoute="Buyers" routes={BrokerRoutes} />
);

export default BrokerBuyers;
