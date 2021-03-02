import React from "react";
import { Auction } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import { Bar } from "react-chartjs-2";
import { DefaultBarGraphOptionsWithStep } from "../../../common/Graphs/DefaultGraphOptions";
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
  //const { auctions } = props;
  const graphData = {
    datasets: [
      {
        borderWidth: 0,
        data: [250_000, 290_000, 350_000, 390_000, 400_000, 420_000],
        backgroundColor: "#ffa726",
      },
    ],
    labels: monthNames.slice(0, 6),
    // These labels appear in the legend and in the tooltips when hovering different arcs
  };
  return (
    <GraphCard
      showControls
      header="Distribution of Auction Size"
      className={props.className ?? "auction-size-distribution-graph-card"}
    >
      <div className="auction-size-distribution-graph-container">
        <Bar
          data={graphData}
          options={DefaultBarGraphOptionsWithStep(100_000)}
        />
      </div>
    </GraphCard>
  );
};

export default AuctionSizeDistributionGraphCard;
