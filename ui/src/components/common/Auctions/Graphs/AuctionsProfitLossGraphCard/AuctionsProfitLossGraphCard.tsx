import {
  Auction,
  Invoice,
} from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import { useParty } from "@daml/react";
import React, { useMemo } from "react";
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
  const buyer = useParty();
  const biddingAuctions = useMemo(() => {
    const openAuctions = auctions.filter((x) => x.status === "AuctionOpen");
    const buyerWonAuctions = openAuctions.filter(
      (x) => x.bids.filter((b) => b.buyer === buyer).length > 0
    );
    const buyerWonBids = buyerWonAuctions.flatMap((x) =>
      x.bids.filter((x) => x.buyer === buyer)
    );
    const sum = buyerWonBids.map((x) => +x.amount).reduce((a, b) => a + b, 0);
    return sum;
  }, [auctions, buyer]);
  const purchasedAuctionsInvoiceQuantity = useMemo(() => {
    const closedAuctions = auctions.filter((x) => x.status !== "AuctionOpen");
    const buyerWonAuctions = closedAuctions.filter(
      (x) =>
        x.bids.filter((b) => b.buyer === buyer && b.status === "BidWon")
          .length > 0
    );
    const buyerWonBids = buyerWonAuctions.flatMap((x) =>
      x.bids.filter((x) => x.buyer === buyer)
    );
    const sum = buyerWonBids
      .map((x) => +x.amount - +x.amount * +x.price)
      .reduce((a, b) => a + b, 0);
    return sum;
  }, [auctions, buyer]);
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
      header="Projected P & L"
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
