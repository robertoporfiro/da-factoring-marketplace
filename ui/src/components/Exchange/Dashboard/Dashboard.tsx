import {
  Auction,
  Invoice,
} from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import { useStreamQueries } from "@daml/react";
import React, { useMemo } from "react";
import BasePage, { IBasePageProps } from "../../BasePage/BasePage";
import ExchangeRoutes from "../ExchangeRoutes";
import AuctionDiscountRateTrendGraphCard from "../Graphs/AuctionDiscountRateTrendGraphCard/AuctionDiscountRateTrendGraphCard";
import AuctionSizeDistributionGraphCard from "../Graphs/AuctionSizeDistributionGraphCard/AuctionSizeDistributionGraphCard";
import AuctionSuccessGraphCard from "../Graphs/AuctionSuccessGraphCard/AuctionSuccessGraphCard";
import AuctionVolumeGraphCard from "../Graphs/AuctionVolumeGraph/AuctionVolumeGraphCard";
import HighestVolumeGraphSection from "../Graphs/HighestVolumeGraphSection/HighestVolumeGraphSection";
import InvoicesAuctionedGraphCard from "../Graphs/InvoicesAuctionedGraphCard/InvoicesAuctionedGraphCard";

import "./Dashboard.css";

let ExchangeDashboard: React.FC<IBasePageProps> = (props) => {
  const auctionContracts = useStreamQueries(Auction).contracts;

  const auctions = useMemo(() => {
    return auctionContracts.map((auctionContract) => auctionContract.payload);
  }, [auctionContracts]);

  const invoiceContracts = useStreamQueries(Invoice).contracts;

  const invoices = useMemo(() => {
    return invoiceContracts.map((invoiceContract) => invoiceContract.payload);
  }, [invoiceContracts]);

  return (
    <BasePage routes={ExchangeRoutes} activeRoute="Dashboard" {...props}>
      <div className="page-subheader">
        <div className="page-subheader-text"> Dashboard </div>
      </div>
      <div className="exchange-graphs-container">
        <AuctionVolumeGraphCard auctions={auctions} />
        <AuctionSizeDistributionGraphCard auctions={auctions} />
        <AuctionSuccessGraphCard auctions={auctions} />
        <InvoicesAuctionedGraphCard invoices={invoices} />
        <AuctionDiscountRateTrendGraphCard auctions={auctions} />
        <HighestVolumeGraphSection invoices={invoices} />
      </div>
    </BasePage>
  );
};

export default ExchangeDashboard;
