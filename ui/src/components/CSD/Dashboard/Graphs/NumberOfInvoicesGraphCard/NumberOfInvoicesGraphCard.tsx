import {
  Auction,
  Invoice,
} from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import React from "react";
import { Line } from "react-chartjs-2";
import {
  DefaultLineGraphOptions,
  DefaultLineGraphOptionsWithStep,
} from "../../../../common/Graphs/DefaultGraphOptions";
import GraphCard from "../../../../common/Graphs/GraphCard/GraphCard";
import { monthNames } from "../../../../common/utils";

import "./NumberOfInvoicesGraphCard.css";
interface NumberOfInvoicesGraphCardProps {
  className?: string;
  invoices: Invoice[];
}
const NumberOfInvoicesGraphCard: React.FC<NumberOfInvoicesGraphCardProps> = (
  props
) => {
  const { invoices } = props;

  const graphData = {
    datasets: [
      {
        borderWidth: 2,
        lineTension: 0,
        fill: false,
        data: [100, 130, 140, 150, 175, 195],
        backgroundColor: "#ffa726",
        borderColor: "#ffa726",
      },
    ],
    labels: monthNames.slice(0, 6),
  };
  return (
    <GraphCard
      header="Invoice"
      className={props.className ?? "number-of-invoices-graph-card"}
      subheader={
        <>
          (Number of Invoices in{" "}
          <div className="graph-subheader-time-emphasis">6 months</div>)
        </>
      }
    >
      <div className="number-of-invoices-graph-container">
        <Line data={graphData} options={DefaultLineGraphOptionsWithStep(40)} />
      </div>
    </GraphCard>
  );
};

export default NumberOfInvoicesGraphCard;
