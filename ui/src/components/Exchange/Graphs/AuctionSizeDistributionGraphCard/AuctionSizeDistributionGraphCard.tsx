import { Auction } from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import React from "react";
import { Bar } from "react-chartjs-2";
import { DefaultBarGraphOptions } from "../../../common/Graphs/DefaultGraphOptions";
import GraphCard from "../../../common/Graphs/GraphCard/GraphCard";
import { monthNames } from "../../../common/utils";

import "./AuctionSizeDistributionGraphCard.css";
interface AuctionSizeDistributionGraphCardProps {
  className?: string;
  auctions: Auction[];
}
const AuctionSizeDistributionGraphCard: React.FC<AuctionSizeDistributionGraphCardProps> = (
  props
) => {
  const { auctions } = props;
  const graphData = {
    datasets: [
      {
        borderWidth: 0,
        data: [
          500_000,
          200_000,
          500_000,
          400_000,
          500_000,
          400_000,
          600_000,
          400_000,
          300_000,
          200_000,
          500_000,
          600_000,
        ],
        backgroundColor: "#ffa726",
      },
    ],
    labels: monthNames.slice(0, 6),
    // These labels appear in the legend and in the tooltips when hovering different arcs
  };
  return (
    <GraphCard
      header="Distribution of Auction Size"
      className={props.className ?? "auction-size-distribution-graph-card"}
    >
      <div className="auction-size-distribution-graph-container">
        <Bar data={graphData} options={DefaultBarGraphOptions} />
      </div>
    </GraphCard>
  );
};

export default AuctionSizeDistributionGraphCard;
