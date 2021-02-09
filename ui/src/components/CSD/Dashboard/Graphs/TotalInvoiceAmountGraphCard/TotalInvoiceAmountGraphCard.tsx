import {
  Auction,
  Invoice,
} from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  DefaultBarGraphOptions,
  DefaultLineGraphOptionsWithStep,
} from "../../../../common/Graphs/DefaultGraphOptions";
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
        data: [250_000, 300_000, 320_000, 360_000, 400_000, 450_000],
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
      subheader={
        <>
          (Invoice amounts in{" "}
          <div className="graph-subheader-time-emphasis">6 months</div>)
        </>
      }
    >
      <div className="total-invoice-amount-graph-container">
        <Bar
          data={graphData}
          options={DefaultLineGraphOptionsWithStep(100_000)}
        />
      </div>
    </GraphCard>
  );
};

export default TotalInvoiceAmountGraphCard;
