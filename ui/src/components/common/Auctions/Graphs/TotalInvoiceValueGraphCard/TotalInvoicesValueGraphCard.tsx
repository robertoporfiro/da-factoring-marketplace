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

import "./TotalInvoicesValueGraphCard.css";
interface TotalInvoicesValueGraphCardProps {
  className?: string;
  auctions: Auction[];
}
const TotalInvoicesValueGraphCardColors = {
  Purchased: "#7BC5F1",
  Bidding: "#8D63CC",
};
const TotalInvoicesValueGraphCard: React.FC<TotalInvoicesValueGraphCardProps> = (
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
  const purchasedAuctions = useMemo(() => {
    const closedAuctions = auctions.filter((x) => x.status !== "AuctionOpen");
    const buyerWonAuctions = closedAuctions.filter(
      (x) =>
        x.bids.filter((b) => b.buyer === buyer && b.status === "BidWon")
          .length > 0
    );
    const buyerWonBids = buyerWonAuctions.flatMap((x) =>
      x.bids.filter((x) => x.buyer === buyer)
    );
    const sum = buyerWonBids.map((x) => +x.quantityFilled).reduce((a, b) => a + b, 0);
    return sum;
  }, [auctions, buyer]);
  const graphData = {
    datasets: [
      {
        data: [purchasedAuctions, biddingAuctions],
        backgroundColor: [
          TotalInvoicesValueGraphCardColors.Purchased,
          TotalInvoicesValueGraphCardColors.Bidding,
        ],
      },
    ],
    labels: ["Purchased", "Bidding"],
  };
  return (
    <GraphCard
      header="Total Invoice Notional Value"
      className={props.className ?? "total-invoices-value-graph-card"}
    >
      <div className="total-invoices-value-graph-contents">
        <div className="total-invoices-value-graph-legend-container">
          <GraphLegend className="total-invoices-value-graph-legend">
            <GraphLegendItem
              indicatorColor={TotalInvoicesValueGraphCardColors.Purchased}
              label="Purchased"
              data={formatAsCurrency(purchasedAuctions)}
            />
            <GraphLegendItem
              indicatorColor={TotalInvoicesValueGraphCardColors.Bidding}
              label="Bidding"
              data={formatAsCurrency(biddingAuctions)}
            />
          </GraphLegend>
        </div>
        <div className="total-invoices-value-graph-container">
          <Doughnut data={graphData} options={DefaultDonutGraphOptions} />
        </div>
      </div>
    </GraphCard>
  );
};

export default TotalInvoicesValueGraphCard;
