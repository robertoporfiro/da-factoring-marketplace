import { Auction } from "@daml.js/da-marketplace/lib/Factoring/Invoice";
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

  return (
    <BasePage routes={ExchangeRoutes} activeRoute="Dashboard" {...props}>
      <div className="page-subheader">
        <div className="page-subheader-text"> Dashboard </div>
      </div>
      <div className="exchange-graphs-container">
        <AuctionVolumeGraphCard auctions={auctions} />
        <AuctionSizeDistributionGraphCard auctions={auctions} />
        <AuctionSuccessGraphCard auctions={auctions} />
        <InvoicesAuctionedGraphCard auctions={auctions} />
        <AuctionDiscountRateTrendGraphCard auctions={auctions} />
        <HighestVolumeGraphSection auctions={auctions} />
      </div>
    </BasePage>
  );
};

export default ExchangeDashboard;
