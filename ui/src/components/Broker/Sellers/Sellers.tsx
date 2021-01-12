import React from "react";

import InvoicesView from "../../common/Invoices/InvoicesView";
import BrokerRoutes from "../BrokerRoutes";

const BrokerSellers: React.FC = () => (
  <InvoicesView activeRoute="Sellers" routes={BrokerRoutes} />
);

export default BrokerSellers;
