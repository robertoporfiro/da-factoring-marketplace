import { Auction } from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import React, { useMemo } from "react";
import GraphCard from "../../../common/Graphs/GraphCard/GraphCard";
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
  auctions: Auction[];
}
const HighestVolumeGraphSection: React.FC<HighestVolumeGraphSectionProps> = (
  props
) => {
  const { auctions } = props;

  const totalAmount = useMemo(() => {
    return auctions.length > 0
      ? auctions
          .map((auction) => +auction.invoices[0].amount)
          .reduce((a, b) => a + b)
      : 0;
  }, [auctions]);
  const numberOfAuctions = useMemo(() => {
    return auctions.length.toString();
  }, [auctions]);

  const averageAmount = useMemo(() => {
    return (+totalAmount / +numberOfAuctions).toFixed(0);
  }, [numberOfAuctions, totalAmount]);

  return (
    <div className="highest-volume-graph-section">
      <GraphCard
        header="Highest Volume"
        className={props.className ?? "highest-volume-graph-card"}
      >
        <div className="highest-volume-graph-items-container">
          <HighestVolumeGraphItem label="ID Number" data={"Amount"} />
          <HighestVolumeGraphItem
            label="G n B"
            data={formatAsCurrency(totalAmount)}
          />
          <HighestVolumeGraphItem
            label="Walmart"
            data={formatAsCurrency(averageAmount)}
          />
          <HighestVolumeGraphItem
            label="Apple"
            data={formatAsCurrency(averageAmount)}
          />
        </div>
      </GraphCard>
      <div className="highest-volume-graph-actions-container">
        <SolidButton
          label="See Most Active Bidders"
          className="graph-action-button"
        />
        <SolidButton
          label="See Most Active Sellers"
          className="graph-action-button"
        />
      </div>
    </div>
  );
};

export default HighestVolumeGraphSection;
