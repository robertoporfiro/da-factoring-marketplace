import {
  Auction,
  Invoice,
} from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import React from "react";
import { Bar } from "react-chartjs-2";
import { DefaultBarGraphOptions } from "../../../../common/Graphs/DefaultGraphOptions";
import GraphCard from "../../../../common/Graphs/GraphCard/GraphCard";
import { monthNames } from "../../../../common/utils";

import "./AuctionWinsGraphCard.css";
interface AuctionWinsGraphCardProps {
  className?: string;
  auctions: Auction[];
}
const AuctionWinsGraphCard: React.FC<AuctionWinsGraphCardProps> = (props) => {
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
    labels: ["1 day", "2 days", "3 days", "4 days", "5 days"],
    // These labels appear in the legend and in the tooltips when hovering different arcs
  };
  return (
    <GraphCard
      header="Auction Wins"
      className={props.className ?? "auction-wins-graph-card"}
    >
      <div className="auction-wins-graph-container">
        <Bar data={graphData} options={DefaultBarGraphOptions} />
      </div>
    </GraphCard>
  );
};

export default AuctionWinsGraphCard;
