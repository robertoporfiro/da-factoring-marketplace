import { Auction } from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import { useStreamQueries } from "@daml/react";
import React, { useMemo } from "react";
import BasePage from "../../BasePage/BasePage";
import CSDRoutes from "../CSDRoutes";

import "./Dashboard.css";
import DuePaymentsValueGraphCard from "./Graphs/DuePaymentsValueGraphCard/DuePaymentsValueGraphCard";
import FuturePaymentsValueGraphCard from "./Graphs/FuturePaymentsValueGraphCard/FuturePaymentsValueGraphCard";
import InvoicesStatusGraphCard from "./Graphs/InvoicesStatusGraphCard/InvoicesStatusGraphCard";
import NumberOfInvoicesGraphCard from "./Graphs/NumberOfInvoicesGraphCard/NumberOfInvoicesGraphCard";
import TotalInvoiceAmountGraphCard from "./Graphs/TotalInvoiceAmountGraphCard/TotalInvoiceAmountGraphCard";

const CSDDashboard: React.FC = () => {
  const auctionContracts = useStreamQueries(
    Auction,
    () => [],
    [],
    (e) => {
      console.log("Unexpected close from Auction: ", e);
    }
  ).contracts;

  const auctions = useMemo(() => {
    return auctionContracts.map((auctionContract) => auctionContract.payload);
  }, [auctionContracts]);
  const invoices = useMemo(() => {
    return auctions.flatMap((auction) => auction.invoices);
  }, [auctions]);
  return (
    <BasePage routes={CSDRoutes} activeRoute="Dashboard">
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
