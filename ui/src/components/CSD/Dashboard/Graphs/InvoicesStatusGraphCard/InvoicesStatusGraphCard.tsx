import {
  Auction,
  Invoice,
} from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { DefaultDonutGraphOptions } from "../../../../common/Graphs/DefaultGraphOptions";
import GraphCard from "../../../../common/Graphs/GraphCard/GraphCard";
import {
  GraphLegend,
  GraphLegendItem,
} from "../../../../common/Graphs/GraphLegend/GraphLegend";

import "./InvoicesStatusGraphCard.css";
interface InvoicesStatusGraphCardProps {
  className?: string;
  invoices: Invoice[];
}
const InvoicesStatusGraphCardColors = {
  Open: "#4CAF50",
  Live: "#EF5350",
  Paid: "#8D63CC",
};
const InvoicesStatusGraphCard: React.FC<InvoicesStatusGraphCardProps> = (
  props
) => {
  const { invoices } = props;
  const graphData = {
    datasets: [
      {
        data: [10, 10, 10],
        backgroundColor: [
          InvoicesStatusGraphCardColors.Open,
          InvoicesStatusGraphCardColors.Live,
          InvoicesStatusGraphCardColors.Paid,
        ],
      },
    ],
    labels: ["Open", "Live", "Paid"],
  };
  return (
    <GraphCard
      header="Invoices"
      className={props.className ?? "invoices-status-graph-card"}
    >
      <div className="invoices-status-graph-contents">
        <div className="invoices-status-graph-legend-container">
          <GraphLegend className="invoices-status-graph-legend">
            <GraphLegendItem
              compact
              indicatorColor={InvoicesStatusGraphCardColors.Open}
              label="Open"
              data="$10,000"
            />
            <GraphLegendItem
              compact
              indicatorColor={InvoicesStatusGraphCardColors.Live}
              label="Live"
              data="$10,000"
            />
            <GraphLegendItem
              compact
              indicatorColor={InvoicesStatusGraphCardColors.Paid}
              label="Paid"
              data="$10,000"
            />
          </GraphLegend>
        </div>

        <div className="invoices-status-graph-container">
          <Doughnut data={graphData} options={DefaultDonutGraphOptions} />
        </div>
      </div>
    </GraphCard>
  );
};

export default InvoicesStatusGraphCard;
