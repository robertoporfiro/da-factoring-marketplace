import { Auction } from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { DefaultDonutGraphOptions } from "../../../common/Graphs/DefaultGraphOptions";
import GraphCard from "../../../common/Graphs/GraphCard/GraphCard";
import {
  GraphLegend,
  GraphLegendItem,
} from "../../../common/Graphs/GraphLegend/GraphLegend";

import "./InvoicesAuctionedGraphCard.css";
interface InvoicesAuctionedGraphCardProps {
  className?: string;
  auctions: Auction[];
}
const InvoicesAuctionedGraphCardColors = {
  traded: "#9575CD",
  held: "#FFA726",
};
const InvoicesAuctionedGraphCardLabels = ["Traded", "Held"];
const InvoicesAuctionedGraphCard: React.FC<InvoicesAuctionedGraphCardProps> = (
  props
) => {
  const { auctions } = props;
  const graphData = {
    datasets: [
      {
        borderWidth: 0,
        data: [9_000_000, 1_000_000],
        backgroundColor: [
          InvoicesAuctionedGraphCardColors.traded,
          InvoicesAuctionedGraphCardColors.held,
        ],
      },
    ],
    labels: InvoicesAuctionedGraphCardLabels,
  };
  return (
    <GraphCard
      header="Invoices Auctioned"
      className={props.className ?? "invoices-auctioned-graph-card"}
    >
      <div className="invoices-auctioned-graph-container">
        <Doughnut data={graphData} options={DefaultDonutGraphOptions} />
      </div>
      <GraphLegend>
        <GraphLegendItem
          indicatorColor={InvoicesAuctionedGraphCardColors.traded}
          label={InvoicesAuctionedGraphCardLabels[0]}
          data="9,000,000"
        />
        <GraphLegendItem
          indicatorColor={InvoicesAuctionedGraphCardColors.held}
          label={InvoicesAuctionedGraphCardLabels[1]}
          data="1,000,000"
        />
      </GraphLegend>
    </GraphCard>
  );
};

export default InvoicesAuctionedGraphCard;
