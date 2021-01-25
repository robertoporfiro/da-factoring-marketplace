import { Auction } from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import React from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  DefaultBarGraphOptions,
  DefaultLineGraphOptions,
} from "../../../common/Graphs/DefaultGraphOptions";
import GraphCard from "../../../common/Graphs/GraphCard/GraphCard";
import { monthNames } from "../../../common/utils";

import "./AuctionDiscountRateTrendGraphCard.css";
interface AuctionDiscountRateTrendGraphCardProps {
  className?: string;
  auctions: Auction[];
}

const LineGraphOptions = {
  borderWidth: 0,
  lineTension: 0,
  bezierCurve: false,
  tooltips: false,
  responsive: true,
  aspectRatio: 2,
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  layout: {
    padding: {
      // left: 10
    },
  },
  scales: {
    xAxes: [
      {
        gridLines: {
          zeroLineColor: "#fff",
          lineWidth: 0,
          zeroLineWidth: 1,
        },

        ticks: {
          beginAtZero: true,
          suggestedMin: 1,
        },
      },
    ],
    yAxes: [
      {
        id: "y-axis-1",
        display: true,
        gridLines: {
          zeroLineColor: "#fff",
          lineWidth: 0,
          zeroLineWidth: 1,
        },
        ticks: {
          beginAtZero: true,
          mirror: false,
          suggestedMin: 0,
        },
      },
      {
        id: "y-axis-2",
        display: true,
        gridLines: {
          zeroLineColor: "#fff",
          lineWidth: 0,
          zeroLineWidth: 1,
        },
        ticks: {
          display: false,
        },
      },
      {
        id: "y-axis-3",
        display: true,
        gridLines: {
          zeroLineColor: "#fff",
          lineWidth: 0,
          zeroLineWidth: 1,
        },
        ticks: {
          display: false,
        },
      },
    ],
  },
};
const AuctionDiscountRateTrendGraphCard: React.FC<AuctionDiscountRateTrendGraphCardProps> = (
  props
) => {
  const { auctions } = props;
  const graphData = {
    datasets: [
      {
        pointRadius: 0,
        borderWidth: 2,
        lineTension: 0,
        fill: false,
        data: [5, 6, 5, 4, 5, 4, 6, 4, 3, 2, 5, 3],
        borderColor: "#ffa726",
        yAxisID: "y-axis-1",
      },
      {
        pointRadius: 0,
        borderWidth: 2,
        lineTension: 0,
        fill: false,
        data: [1, 2, 3, 4, 1, 2, 3, 4, 3, 2, 5, 3],
        borderColor: "#fff",
        yAxisID: "y-axis-2",
      },
      {
        pointRadius: 0,
        borderWidth: 2,
        lineTension: 0,
        fill: false,
        data: [3, 5, 7, 8, 6, 2, 3, 4, 3, 2, 5, 3],
        borderColor: "#EF5350",
        yAxisID: "y-axis-3",
      },
    ],
    labels: monthNames.slice(0, 6),
  };
  return (
    <GraphCard
      header="Discount Rate Trend"
      className={props.className ?? "auction-discount-rate-trend-graph-card"}
    >
      <div className="auction-discount-rate-trend-graph-container">
        <Line data={graphData} options={LineGraphOptions} />
      </div>
    </GraphCard>
  );
};

export default AuctionDiscountRateTrendGraphCard;
