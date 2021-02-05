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
import { formatAsCurrency } from "../../../utils";

import "./AuctionsProfitLossGraphCard.css";
interface AuctionsProfitLossGraphCardProps {
  className?: string;
  auctions: Auction[];
}
const AuctionsProfitLossGraphCardColors = {
  ExpectedReturn: "#4caf50",
  TotalInvoiceAmount: "#7BC5F1",
  AuctionAmounts: "#FFA726",
};
const AuctionsProfitLossGraphCard: React.FC<AuctionsProfitLossGraphCardProps> = (
  props
) => {
  const { auctions } = props;
  const buyer = useParty();
  const biddingAuctionsAmount = useMemo(() => {
    const validAuctions = auctions.filter((x) => x.status !== "AuctionFailed");
    const buyerWonAuctions = validAuctions.filter(
      (x) => x.bids.filter((b) => b.buyer === buyer).length > 0
    );
    const buyerWonBids = buyerWonAuctions.flatMap((x) =>
      x.bids.filter((x) => x.buyer === buyer)
    );
    const sum = buyerWonBids.map((x) => +x.quantityFilled).reduce((a, b) => a + b, 0);
    return sum;
  }, [auctions, buyer]);

  const biddingAuctionsPrice = useMemo(() => {
    const validAuctions = auctions.filter((x) => x.status !== "AuctionFailed");
    const buyerWonAuctions = validAuctions.filter(
      (x) => x.bids.filter((b) => b.buyer === buyer).length > 0
    );
    const buyerWonBids = buyerWonAuctions.flatMap((x) =>
      x.bids.filter((x) => x.buyer === buyer)
    );
    const sum = buyerWonBids
      .map((x) => +x.quantityFilled * +x.price)
      .reduce((a, b) => a + b, 0);
    return sum;
  }, [auctions, buyer]);

  const graphData = {
    datasets: [
      {
        data: [biddingAuctionsAmount, biddingAuctionsPrice],
        backgroundColor: [
          AuctionsProfitLossGraphCardColors.TotalInvoiceAmount,
          AuctionsProfitLossGraphCardColors.AuctionAmounts,
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
              indicatorColor={AuctionsProfitLossGraphCardColors.ExpectedReturn}
              label="Expected Return"
              data={formatAsCurrency(
                biddingAuctionsAmount - biddingAuctionsPrice
              )}
            />
            <GraphLegendItem
              indicatorColor={
                AuctionsProfitLossGraphCardColors.TotalInvoiceAmount
              }
              label="Total Invoice Amount"
              data={formatAsCurrency(biddingAuctionsAmount)}
            />
            <GraphLegendItem
              indicatorColor={AuctionsProfitLossGraphCardColors.AuctionAmounts}
              label="Total Auction Quantity"
              data={formatAsCurrency(biddingAuctionsPrice)}
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
