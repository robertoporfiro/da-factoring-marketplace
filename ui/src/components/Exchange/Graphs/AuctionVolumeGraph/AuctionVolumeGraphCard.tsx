import { Auction } from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { DefaultDonutGraphOptions } from "../../../common/Graphs/DefaultGraphOptions";
import GraphCard from "../../../common/Graphs/GraphCard/GraphCard";
import {
  GraphLegend,
  GraphLegendItem,
} from "../../../common/Graphs/GraphLegend/GraphLegend";
import { monthNames } from "../../../common/utils";

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

  return (
    <GraphCard
      header="Volume"
      className={props.className ?? "auction-volume-graph-card"}
    >
      <div className="auction-volume-graph-items-container">
        <AuctionVolumeGraphItem label="Total Amount" data="$9,000,000" />
        <AuctionVolumeGraphItem label="Average Size" data="$200,000" />
        <AuctionVolumeGraphItem label="Auctions" data="45" />
      </div>
    </GraphCard>
  );
};

export default AuctionVolumeGraphCard;
