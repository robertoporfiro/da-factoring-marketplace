import { Invoice } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import React, { useMemo } from "react";
import { useContractQuery } from "../../../websocket/queryStream";
import BasePage, { IBasePageProps } from "../../BasePage/BasePage";
import CSDRoutes from "../CSDRoutes";

import "./Dashboard.scss";
import DuePaymentsValueGraphCard from "./Graphs/DuePaymentsValueGraphCard/DuePaymentsValueGraphCard";
import FuturePaymentsValueGraphCard from "./Graphs/FuturePaymentsValueGraphCard/FuturePaymentsValueGraphCard";
import InvoicesStatusGraphCard from "./Graphs/InvoicesStatusGraphCard/InvoicesStatusGraphCard";
import NumberOfInvoicesGraphCard from "./Graphs/NumberOfInvoicesGraphCard/NumberOfInvoicesGraphCard";
import TotalInvoiceAmountGraphCard from "./Graphs/TotalInvoiceAmountGraphCard/TotalInvoiceAmountGraphCard";

const CSDDashboard: React.FC<IBasePageProps> = (props) => {
  /*
  const auctionContracts = useContractQuery(Auction).contracts;


  const auctions = useMemo(() => {
    return auctionContracts.map((auctionContract) => auctionContract.payload);
  }, [auctionContracts]);
  */
  const invoiceContracts = useContractQuery(Invoice);

  const invoices = useMemo(() => {
    return invoiceContracts.map((invoiceContract) => invoiceContract.contractData);
  }, [invoiceContracts]);
  return (
    <BasePage routes={CSDRoutes} activeRoute="Dashboard" {...props}>
      <div className="page-subheader">
        <div className="page-subheader-text"> Dashboard </div>
      </div>
      <div className="csd-graphs-container">
        <NumberOfInvoicesGraphCard invoices={invoices} />
        <TotalInvoiceAmountGraphCard invoices={invoices} />
        <FuturePaymentsValueGraphCard invoices={invoices} />
        <DuePaymentsValueGraphCard invoices={invoices} />
        <InvoicesStatusGraphCard invoices={invoices} />
      </div>
    </BasePage>
  );
};

export default CSDDashboard;
