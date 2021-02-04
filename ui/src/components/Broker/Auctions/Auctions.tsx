import React from "react";
import AuctionsView from "../../common/Auctions/AuctionsView/AuctionsView";

import BrokerRoutes from "../BrokerRoutes";

const BrokerBuyers: React.FC = () => (
  <AuctionsView activeRoute="Auctions" routes={BrokerRoutes} />
);

export default BrokerBuyers;
