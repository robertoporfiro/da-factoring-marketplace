import {
  Auction,
  Invoice,
} from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import { groupBy, sortBy } from "lodash";
import React, { useMemo, useState } from "react";
import GraphCard from "../../../common/Graphs/GraphCard/GraphCard";
import { useRegistryLookup } from "../../../common/RegistryLookup";
import { SolidButton } from "../../../common/SolidButton/SolidButton";
import { formatAsCurrency } from "../../../common/utils";

import "./HighestVolumeGraphSection.css";

interface HighestVolumeGraphItemProps {
  label: string;
  data: string;
}
const HighestVolumeGraphItem: React.FC<HighestVolumeGraphItemProps> = (
  props
) => {
  return (
    <div className="highest-volume-graph-item">
      <div className="highest-volume-graph-data">{props.data}</div>
      <div className="highest-volume-graph-item-label">{props.label}</div>
    </div>
  );
};

interface HighestVolumeGraphSectionProps {
  className?: string;
  invoices: Invoice[];
}
const HighestVolumeGraphSection: React.FC<HighestVolumeGraphSectionProps> = (
  props
) => {
  const [graphMode, setGraphMode] = useState<"Payer" | "Bidder" | "Seller">(
    "Payer"
  );
  const { invoices } = props;
  const registry = useRegistryLookup();

  const highestPayers = useMemo(() => {
    const payerGroups = groupBy(invoices, (invoice) => invoice.payer);
    const data: Array<{ amount: number; label: string }> = [];
    for (const [payer, payerInvoices] of Object.entries(payerGroups)) {
      const payerSum = payerInvoices
        .map((i) => +i.amount)
        .reduce((a, b) => a + b, 0);
      data.push({ label: payer, amount: payerSum });
    }
    return data.sort((a, b) => b.amount - a.amount).slice(0, 3);
  }, [invoices]);

  const higestSellers = useMemo(() => {
    const sellerGroups = groupBy(invoices, (invoice) => invoice.seller);
    const data: Array<{ amount: number; label: string }> = [];
    for (const [seller, payerInvoices] of Object.entries(sellerGroups)) {
      const sellerUser = registry.sellerMap.get(seller);
      const sellerSum = payerInvoices
        .map((i) => +i.amount)
        .reduce((a, b) => a + b, 0);
      data.push({
        label: `${sellerUser?.firstName ?? ""} ${sellerUser?.lastName ?? ""}`,
        amount: sellerSum,
      });
    }
    return data.sort((a, b) => b.amount - a.amount).slice(0, 3);
  }, [invoices, registry.sellerMap]);

  const volumeData = useMemo(() => {
    if (graphMode === "Seller") {
      return higestSellers;
    } else if (graphMode === "Payer") {
      return highestPayers;
    }
  }, [graphMode, higestSellers, highestPayers]);

  return (
    <div className="highest-volume-graph-section">
      <GraphCard
        showControls
        header={`Highest Volume by ${graphMode}`}
        className={props.className ?? "highest-volume-graph-card"}
      >
        <div className="highest-volume-graph-items-container">
          <HighestVolumeGraphItem label="Name" data={"Amount"} />
          {volumeData.map((data) => (
            <HighestVolumeGraphItem
              label={data.label}
              data={formatAsCurrency(data.amount)}
            />
          ))}
        </div>
      </GraphCard>
      <div className="highest-volume-graph-actions-container">
        {graphMode !== "Payer" && (
          <SolidButton
            label="See Most Active Payers"
            className="graph-action-button"
            onClick={() => {
              setGraphMode("Payer");
            }}
          />
        )}
        {graphMode !== "Seller" && (
          <SolidButton
            label="See Most Active Sellers"
            className="graph-action-button"
            onClick={() => {
              setGraphMode("Seller");
            }}
          />
        )}
        {graphMode !== "Bidder" && (
          <SolidButton
            label="See Most Active Bidders"
            className="graph-action-button"
            onClick={() => {
              setGraphMode("Bidder");
            }}
            disabled={true}
          />
        )}
      </div>
    </div>
  );
};

export default HighestVolumeGraphSection;
