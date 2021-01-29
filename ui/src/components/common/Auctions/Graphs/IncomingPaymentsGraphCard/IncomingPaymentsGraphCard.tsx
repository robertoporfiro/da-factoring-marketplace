import {
  Auction,
  Invoice,
} from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import React from "react";
import { Bar } from "react-chartjs-2";
import { DefaultBarGraphOptions } from "../../../../common/Graphs/DefaultGraphOptions";
import GraphCard from "../../../../common/Graphs/GraphCard/GraphCard";
import { monthNames } from "../../../../common/utils";

import "./IncomingPaymentsGraphCard.css";
interface IncomingPaymentsGraphCardProps {
  className?: string;
  auctions: Auction[];
}
const IncomingPaymentsGraphCard: React.FC<IncomingPaymentsGraphCardProps> = (
  props
) => {
  const { auctions } = props;
  const graphData = {
    datasets: [
      {
        borderWidth: 0,
        data: [
          500_000,
          200_000,
          500_000,
          400_000,
          500_000,
          400_000,
          600_000,
          400_000,
          300_000,
          200_000,
          500_000,
          600_000,
        ],
        backgroundColor: "#ffa726",
      },
    ],
    labels: ["1-10", "11-20", "20-30"],
    // These labels appear in the legend and in the tooltips when hovering different arcs
  };
  return (
    <GraphCard
      header="Incoming from Payor"
      className={props.className ?? "incoming-payments-graph-card"}
    >
      <div className="incoming-payments-graph-container">
        <Bar data={graphData} options={DefaultBarGraphOptions} />
      </div>
    </GraphCard>
  );
};

export default IncomingPaymentsGraphCard;
