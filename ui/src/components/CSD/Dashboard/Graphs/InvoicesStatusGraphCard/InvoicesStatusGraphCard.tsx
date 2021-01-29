import {
  Auction,
  Invoice,
  InvoiceStatus,
} from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { DefaultDonutGraphOptions } from "../../../../common/Graphs/DefaultGraphOptions";
import GraphCard from "../../../../common/Graphs/GraphCard/GraphCard";
import {
  GraphLegend,
  GraphLegendItem,
} from "../../../../common/Graphs/GraphLegend/GraphLegend";
import InvoicesView from "../../../../common/Invoices/InvoicesView";
import { formatAsCurrency } from "../../../../common/utils";

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
  const [state, setState] = useState({
    open: 0,
    live: 0,
    paid: 0,
  });
  const { invoices } = props;
  useEffect(() => {
    const openInvoices = invoices
      .filter((invoice) => invoice.status.tag === "InvoiceOpen")
      .map((invoice) => +invoice.amount)
      .reduce((a, b) => a + b, 0);
    const liveInvoices = invoices
      .filter((invoice) => invoice.status.tag === "InvoiceLive")
      .map((invoice) => +invoice.amount)
      .reduce((a, b) => a + b, 0);
    const paidInvoices = invoices
      .filter((invoice) => invoice.status.tag === "InvoicePaid")
      .map((invoice) => +invoice.amount)
      .reduce((a, b) => a + b, 0);
    setState({
      open: openInvoices,
      live: liveInvoices,
      paid: paidInvoices,
    });
  }, [invoices]);
  const graphData = {
    datasets: [
      {
        data: [state.open, state.live, state.paid],
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
            {state.open > 0 && (
              <GraphLegendItem
                compact
                indicatorColor={InvoicesStatusGraphCardColors.Open}
                label="Open"
                data={formatAsCurrency(state.open)}
              />
            )}

            {state.live > 0 && (
              <GraphLegendItem
                compact
                indicatorColor={InvoicesStatusGraphCardColors.Live}
                label="Live"
                data={formatAsCurrency(state.live)}
              />
            )}
            {state.paid > 0 && (
              <GraphLegendItem
                compact
                indicatorColor={InvoicesStatusGraphCardColors.Paid}
                label="Paid"
                data={formatAsCurrency(state.paid)}
              />
            )}
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
