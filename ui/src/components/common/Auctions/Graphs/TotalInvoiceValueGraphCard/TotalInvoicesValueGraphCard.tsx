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

import "./TotalInvoicesValueGraphCard.css";
interface TotalInvoicesValueGraphCardProps {
  className?: string;
  auctions: Auction[];
}
const TotalInvoicesValueGraphCardColors = {
  Purchased: "#7BC5F1",
  Winning: "#ffa726",
  Bidding: "#8D63CC",
};
const TotalInvoicesValueGraphCard: React.FC<TotalInvoicesValueGraphCardProps> = (
  props
) => {
  const { auctions } = props;
  const graphData = {
    datasets: [
      {
        data: [10, 10, 10],
        backgroundColor: [
          TotalInvoicesValueGraphCardColors.Purchased,
          TotalInvoicesValueGraphCardColors.Winning,
          TotalInvoicesValueGraphCardColors.Bidding,
        ],
      },
    ],
    labels: ["Purchased", "Winning", "Bidding"],
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
              data="$10,000"
            />
            <GraphLegendItem
              indicatorColor={TotalInvoicesValueGraphCardColors.Winning}
              label="Winning"
              data="$10,000"
            />
            <GraphLegendItem
              indicatorColor={TotalInvoicesValueGraphCardColors.Bidding}
              label="Bidding"
              data="$10,000"
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
