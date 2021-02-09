import { Auction } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import React, { useMemo } from "react";
import GraphCard from "../../../common/Graphs/GraphCard/GraphCard";
import { formatAsCurrency } from "../../../common/utils";

import "./AuctionVolumeGraphCard.css";

interface AuctionVolumeGraphCardItemProps {
  label: string;
  data: string;
}
const AuctionVolumeGraphItem: React.FC<AuctionVolumeGraphCardItemProps> = (
  props
) => {
  return (
    <div className="auction-volume-graph-item">
      <div className="auction-volume-graph-data">{props.data}</div>
      <div className="auction-volume-graph-item-label">{props.label}</div>
    </div>
  );
};

interface AuctionVolumeGraphCardProps {
  className?: string;
  auctions: Auction[];
}
const AuctionVolumeGraphCard: React.FC<AuctionVolumeGraphCardProps> = (
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
    <GraphCard
      header="Volume"
      className={props.className ?? "auction-volume-graph-card"}
    >
      <div className="auction-volume-graph-items-container">
        <AuctionVolumeGraphItem
          label="Total Amount"
          data={formatAsCurrency(totalAmount)}
        />
        <AuctionVolumeGraphItem
          label="Average Size"
          data={formatAsCurrency(averageAmount)}
        />
        <AuctionVolumeGraphItem
          label="Auctions"
          data={auctions.length.toString()}
        />
      </div>
    </GraphCard>
  );
};

export default AuctionVolumeGraphCard;
