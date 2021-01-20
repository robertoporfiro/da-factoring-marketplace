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

import "./AuctionSuccessGraphCard.css";
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
  const graphData = {
    datasets: [
      {
        data: [85, 15],
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
          data="85%"
        />
        <GraphLegendItem
          indicatorColor={AuctionSuccessGraphCardColors.failedRed}
          label="Failed"
          data="15%"
        />
      </GraphLegend>
    </GraphCard>
  );
};

export default AuctionSuccessGraphCard;
