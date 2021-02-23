import React, { PropsWithChildren } from "react";
import { IBasePageProps } from "../../BasePage/BasePage";

import InvoicesView from "../../common/Invoices/InvoicesView/InvoicesView";

const SellerInvoices: React.FC<IBasePageProps> = (props) => (
  <InvoicesView {...props} />
);

export default SellerInvoices;
