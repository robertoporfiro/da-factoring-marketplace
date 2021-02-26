import React from "react";
import { IBasePageProps } from "../../BasePage/BasePage";
import { FactoringRole } from "../../common/FactoringRole";

import InvoicesView from "../../common/Invoices/InvoicesView/InvoicesView";
import BrokerRoutes from "../BrokerRoutes";

const BrokerSellers: React.FC<IBasePageProps> = (props) => (
  <InvoicesView
    activeRoute="Sellers"
    routes={BrokerRoutes}
    userRole={FactoringRole.Broker}
    {...props}
  />
);

export default BrokerSellers;
