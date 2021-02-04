import {
  Auction,
  Invoice,
} from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import { useStreamQueries } from "@daml/react";
import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { DefaultDonutGraphOptions } from "../../../common/Graphs/DefaultGraphOptions";
import GraphCard from "../../../common/Graphs/GraphCard/GraphCard";
import {
  GraphLegend,
  GraphLegendItem,
} from "../../../common/Graphs/GraphLegend/GraphLegend";
import { formatAsCurrency } from "../../../common/utils";

import "./InvoicesAuctionedGraphCard.css";
interface InvoicesAuctionedGraphCardProps {
  className?: string;
  invoices: Invoice[];
}
const InvoicesAuctionedGraphCardColors = {
  traded: "#9575CD",
  held: "#FFA726",
};
const InvoicesAuctionedGraphCardLabels = ["Traded", "Held"];
const InvoicesAuctionedGraphCard: React.FC<InvoicesAuctionedGraphCardProps> = (
  props
) => {
  const { invoices } = props;
  const tradedInvoicesSum = useMemo(() => {
    return invoices
      .filter((x) => x.status.tag !== "InvoiceOpen")
      .map((i) => +i.amount)
      .reduce((a, b) => a + b, 0);
  }, [invoices]);
  const heldInvoicesSum = useMemo(() => {
    return invoices
      .filter((x) => x.status.tag === "InvoiceOpen")
      .map((i) => +i.amount)
      .reduce((a, b) => a + b, 0);
  }, [invoices]);

  const graphData = {
    datasets: [
      {
        borderWidth: 0,
        data: [tradedInvoicesSum, heldInvoicesSum],
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
          data={formatAsCurrency(tradedInvoicesSum)}
        />
        <GraphLegendItem
          indicatorColor={InvoicesAuctionedGraphCardColors.held}
          label={InvoicesAuctionedGraphCardLabels[1]}
          data={formatAsCurrency(heldInvoicesSum)}
        />
      </GraphLegend>
    </GraphCard>
  );
};

export default InvoicesAuctionedGraphCard;
