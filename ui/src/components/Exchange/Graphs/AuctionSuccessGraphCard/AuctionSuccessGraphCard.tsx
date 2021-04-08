import { Auction } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { DefaultDonutGraphOptions } from "../../../common/Graphs/DefaultGraphOptions";
import GraphCard from "../../../common/Graphs/GraphCard/GraphCard";
import {
  GraphLegend,
  GraphLegendItem,
} from "../../../common/Graphs/GraphLegend/GraphLegend";
import { auctionSuccessful } from "../../../common/utils";

import "./AuctionSuccessGraphCard.scss";
interface AuctionSuccessGraphCardProps {
  className?: string;
  auctions: Auction[];
}
const AuctionSuccessGraphCardColors = {
  successGreen: "#4caf50",
  failedRed: "#EF5350",
};
const AuctionSuccessGraphCard: React.FC<AuctionSuccessGraphCardProps> = (
  props
) => {
  const { auctions } = props;
  const [state, setState] = useState({
    successful: 100,
    failed: 0,
  });
  useEffect(() => {
    let successfulAuctionsCount = 0,
      failedAuctionsCount = 0;
    for (let i = 0; i < auctions.length; i++) {
      if (auctionSuccessful(auctions[i])) {
        successfulAuctionsCount++;
      } else {
        failedAuctionsCount++;
      }
    }
    setState({
      successful: successfulAuctionsCount,
      failed: failedAuctionsCount,
    });
  }, [auctions]);
  const graphData = {
    datasets: [
      {
        data: [state.successful, state.failed],
        backgroundColor: [
          AuctionSuccessGraphCardColors.successGreen,
          AuctionSuccessGraphCardColors.failedRed,
        ],
      },
    ],
    labels: ["Sucess", "Failed"],
  };
  return (
    <GraphCard
      showControls
      header="Auction Success"
      className={props.className ?? "auction-success-graph-card"}
    >
      <div className="auction-success-graph-container">
        <Doughnut data={graphData} options={DefaultDonutGraphOptions} />
      </div>
      <GraphLegend>
        <GraphLegendItem
          indicatorColor={AuctionSuccessGraphCardColors.successGreen}
          label="Success"
          data={state.successful.toFixed(0)}
        />
        <GraphLegendItem
          indicatorColor={AuctionSuccessGraphCardColors.failedRed}
          label="Failed"
          data={state.failed.toFixed(0)}
        />
      </GraphLegend>
    </GraphCard>
  );
};

export default AuctionSuccessGraphCard;
