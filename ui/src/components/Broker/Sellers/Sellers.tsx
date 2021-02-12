import React from "react";
import { IBasePageProps } from "../../BasePage/BasePage";

import InvoicesView from "../../common/Invoices/InvoicesView";
import BrokerRoutes from "../BrokerRoutes";

const BrokerSellers: React.FC<IBasePageProps> = (props) => (
  <InvoicesView activeRoute="Sellers" routes={BrokerRoutes} {...props} />
);

export default BrokerSellers;
