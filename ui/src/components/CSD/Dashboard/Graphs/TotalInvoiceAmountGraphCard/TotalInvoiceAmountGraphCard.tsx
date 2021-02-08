import { Auction, Invoice } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import React from "react";
import { Bar } from "react-chartjs-2";
import { DefaultBarGraphOptions } from "../../../../common/Graphs/DefaultGraphOptions";
import GraphCard from "../../../../common/Graphs/GraphCard/GraphCard";
import { monthNames } from "../../../../common/utils";

import "./TotalInvoiceAmountGraphCard.css";
interface TotalInvoiceAmountGraphCardProps {
  className?: string;
  invoices: Invoice[];
}
const TotalInvoiceAmountGraphCard: React.FC<TotalInvoiceAmountGraphCardProps> = (
  props
) => {
  const { invoices } = props;
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
    labels: monthNames.slice(0, 6),
    // These labels appear in the legend and in the tooltips when hovering different arcs
  };
  return (
    <GraphCard
      header="Invoice Amounts"
      className={props.className ?? "total-invoice-amount-graph-card"}
    >
      <div className="total-invoice-amount-graph-container">
        <Bar data={graphData} options={DefaultBarGraphOptions} />
      </div>
    </GraphCard>
  );
};

export default TotalInvoiceAmountGraphCard;
