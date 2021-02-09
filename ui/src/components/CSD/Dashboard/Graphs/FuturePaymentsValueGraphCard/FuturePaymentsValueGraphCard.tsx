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

import "./FuturePaymentsValueGraphCard.css";
interface FuturePaymentsValueGraphCardProps {
  className?: string;
  invoices: Invoice[];
}
const FuturePaymentsValueGraphCard: React.FC<FuturePaymentsValueGraphCardProps> = (
  props
) => {
  const { invoices } = props;
  const graphData = {
    datasets: [
      {
        borderWidth: 2,
        lineTension: 0,
        fill: false,
        data: [200_000, 350_000, 385_000, 460_000],
        backgroundColor: "#ffa726",
        borderColor: "#ffa726",
      },
    ],
    labels: ["1 week", "2 weeks", "3 weeks", "4 weeks"],
  };
  return (
    <GraphCard
      header="Payment"
      className={props.className ?? "future-payments-value-graph-card"}
      subheader={
        <>
          (Payor to investor in the{" "}
          <div className="graph-subheader-time-emphasis">next 1 to 4 weeks</div>)
        </>
      }
    >
      <div className="future-payments-value-graph-container">
        <Line
          data={graphData}
          options={DefaultLineGraphOptionsWithStep(100_000)}
        />
      </div>
    </GraphCard>
  );
};

export default FuturePaymentsValueGraphCard;
