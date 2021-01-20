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
  successGreen: "#4caf50",
  failedRed: "#EF5350",
};
const InvoicesStatusGraphCard: React.FC<InvoicesStatusGraphCardProps> = (
  props
) => {
  const { invoices } = props;
  const graphData = {
    datasets: [
      {
        data: [85, 15],
        backgroundColor: [
          InvoicesStatusGraphCardColors.successGreen,
          InvoicesStatusGraphCardColors.failedRed,
        ],
      },
    ],
    labels: ["Sucess", "Failed"],
  };
  return (
    <GraphCard
      header="Invoices"
      className={props.className ?? "invoices-status-graph-card"}
    >
      <div className="invoices-status-graph-container">
        <Doughnut data={graphData} options={DefaultDonutGraphOptions} />
      </div>
      <GraphLegend>
        <GraphLegendItem
          indicatorColor={InvoicesStatusGraphCardColors.successGreen}
          label="New"
          data="$10,000"
        />
        <GraphLegendItem
          indicatorColor={InvoicesStatusGraphCardColors.failedRed}
          label="In Auction"
          data="$10,000"
        />
      </GraphLegend>
    </GraphCard>
  );
};

export default InvoicesStatusGraphCard;
