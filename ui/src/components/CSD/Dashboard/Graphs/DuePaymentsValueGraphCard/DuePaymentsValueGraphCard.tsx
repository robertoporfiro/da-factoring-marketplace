import {
  Auction,
  Invoice,
} from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import React from "react";
import { Line } from "react-chartjs-2";
import {
  DefaultLineGraphOptions,
  DefaultLineGraphOptionsWithStep,
} from "../../../../common/Graphs/DefaultGraphOptions";
import GraphCard from "../../../../common/Graphs/GraphCard/GraphCard";
import { monthNames } from "../../../../common/utils";

import "./DuePaymentsValueGraphCard.css";
interface DuePaymentsValueGraphCardProps {
  className?: string;
  invoices: Invoice[];
}
const DuePaymentsValueGraphCard: React.FC<DuePaymentsValueGraphCardProps> = (
  props
) => {
  const { invoices } = props;
  const graphData = {
    datasets: [
      {
        borderWidth: 2,
        lineTension: 0,
        fill: false,
        data: [100_000, 280_000, 290_000, 330_000, 340_000, 370_000],
        backgroundColor: "#ffa726",
        borderColor: "#ffa726",
      },
    ],
    labels: monthNames.slice(0, 6),
  };
  return (
    <GraphCard
      header="Payers Past Due"
      className={props.className ?? "due-payments-value-graph-card"}
      subheader={
        <>
          (Payor past due in{" "}
          <div className="graph-subheader-time-emphasis">6 months</div>)
        </>
      }
    >
      <div className="due-payments-value-graph-container">
        <Line
          data={graphData}
          options={DefaultLineGraphOptionsWithStep(100_000)}
        />
      </div>
    </GraphCard>
  );
};

export default DuePaymentsValueGraphCard;
