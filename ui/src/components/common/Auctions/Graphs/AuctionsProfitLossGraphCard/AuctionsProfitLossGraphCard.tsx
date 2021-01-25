import {
  Auction,
  Invoice,
} from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { DefaultDonutGraphOptions } from "../../../Graphs/DefaultGraphOptions";
import GraphCard from "../../../Graphs/GraphCard/GraphCard";
import {
  GraphLegend,
  GraphLegendItem,
} from "../../../Graphs/GraphLegend/GraphLegend";

import "./AuctionsProfitLossGraphCard.css";
interface AuctionsProfitLossGraphCardProps {
  className?: string;
  auctions: Auction[];
}
const AuctionsProfitLossGraphCardColors = {
  TotalInvoiceAmount: "#7BC5F1",
  HighestBid: "#FFA726",
};
const AuctionsProfitLossGraphCard: React.FC<AuctionsProfitLossGraphCardProps> = (
  props
) => {
  const { auctions } = props;
  const graphData = {
    datasets: [
      {
        data: [10000, 8000],
        backgroundColor: [
          AuctionsProfitLossGraphCardColors.TotalInvoiceAmount,
          AuctionsProfitLossGraphCardColors.HighestBid,
        ],
      },
    ],
    labels: ["Total Invoice Amount", "Highest Bid"],
  };
  return (
    <GraphCard
      header="Projected P and L"
      className={props.className ?? "auctions-profit-loss-graph-card"}
    >
      <div className="auctions-profit-loss-graph-contents">
        <div className="auctions-profit-loss-graph-legend-container">
          <GraphLegend className="auctions-profit-loss-graph-legend">
            <GraphLegendItem
              indicatorColor={
                AuctionsProfitLossGraphCardColors.TotalInvoiceAmount
              }
              label="Total Invoice Amount"
              data="$10,000"
            />
            <GraphLegendItem
              indicatorColor={AuctionsProfitLossGraphCardColors.HighestBid}
              label="Highest Bid"
              data="$8,000"
            />
          </GraphLegend>
        </div>
        <div className="auctions-profit-loss-graph-container">
          <Doughnut data={graphData} options={DefaultDonutGraphOptions} />
        </div>
      </div>
    </GraphCard>
  );
};

export default AuctionsProfitLossGraphCard;
