import React from "react";
import { Auction } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import { Line } from "react-chartjs-2";
/*
import {
  DefaultBarGraphOptions,
  DefaultLineGraphOptions,
} from "../../../common/Graphs/DefaultGraphOptions";
*/
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
    position: "top",
    maxHeight: 5,
  },
  layout: {
    padding: {
      left: -20,
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
          min: 0,
          precision: 2,
        },
      },
    ],
    yAxes: [
      {
        id: "cosmetic",
        display: true,
        gridLines: {
          zeroLineColor: "#fff",
          lineWidth: 0,
          zeroLineWidth: 1,
        },
        ticks: {
          beginAtZero: true,
          display: false,
          min: 0,
        },
      },
      {
        id: "min",
        display: true,
        gridLines: {
          zeroLineColor: "#fff",
          lineWidth: 0,
          zeroLineWidth: 1,
        },
        ticks: {
          beginAtZero: true,
          display: true,
          suggestedMin: 0,
          autoskip: true,
          min: 4,
          max: 9,
          stepSize: 1,
          callback: (value: number) => {
            return `${value.toFixed(2)} %`;
          },
        },
      },
      {
        id: "max",
        display: true,
        gridLines: {
          zeroLineColor: "#fff",
          lineWidth: 0,
          zeroLineWidth: 1,
        },
        ticks: {
          beginAtZero: true,
          display: false,
          min: 4,
          max: 9,
          stepSize: 1,
        },
      },
      {
        id: "avg",
        display: true,
        gridLines: {
          zeroLineColor: "#fff",
          lineWidth: 0,
          zeroLineWidth: 1,
        },
        ticks: {
          beginAtZero: true,
          display: false,
          min: 4,
          max: 9,
          stepSize: 1,
        },
      },
    ],
  },
};
const AuctionDiscountRateTrendGraphCard: React.FC<AuctionDiscountRateTrendGraphCardProps> = (
  props
) => {
  /*
  const { auctions } = props;
  const bidContracts = useContractQuery(Bid).contracts;
  
  const bids = useMemo(() => {
    return bidContracts.map((bidContract) => bidContract.payload);
  }, [bidContracts]);
  
  const minRateTrend = useMemo(() => {
    return bids.map;
  }, [bids]);
*/
  const graphData = {
    datasets: [
      {
        pointRadius: 0,
        borderWidth: 2,
        lineTension: 0,
        fill: false,
        data: [5.0, 6.0, 6.0, 5.5, 6.1, 6.1],
        borderColor: "#EF5350",
        yAxisID: "min",
        label: "",
      },
      {
        pointRadius: 0,
        borderWidth: 2,
        lineTension: 0,
        fill: false,
        data: [7.0, 6.85, 7.1, 6.8, 7.1, 7.1],
        borderColor: "#ffa726",
        yAxisID: "avg",
        label: "",
      },
      {
        pointRadius: 0,
        borderWidth: 2,
        lineTension: 0,
        fill: false,
        data: [8.0, 8.5, 8.2, 7.8, 8.7, 8.7],
        borderColor: "#4CAF50",
        yAxisID: "max",
        label: "",
      },
    ],
    labels: monthNames.slice(0, 6),
  };
  return (
    <GraphCard
      showControls
      header="Discount Rate Trend"
      className={props.className ?? "auction-discount-rate-trend-graph-card"}
    >
      <div className="auction-discount-rate-trend-graph-legend">
        <div className="auction-discount-rate-trend-graph-legend-item">
          <div
            className="auction-discount-rate-trend-graph-legend-item-indicator"
            style={{ backgroundColor: "#EF5350" }}
          ></div>
          <div>Min</div>
        </div>
        <div className="auction-discount-rate-trend-graph-legend-item">
          <div
            className="auction-discount-rate-trend-graph-legend-item-indicator"
            style={{ backgroundColor: "#ffa726" }}
          ></div>
          <div>Avg</div>
        </div>
        <div className="auction-discount-rate-trend-graph-legend-item">
          <div
            className="auction-discount-rate-trend-graph-legend-item-indicator"
            style={{ backgroundColor: "#4CAF50" }}
          ></div>
          <div>Max</div>
        </div>
      </div>
      <div className="auction-discount-rate-trend-graph-container">
        <Line data={graphData} options={LineGraphOptions} />
      </div>
    </GraphCard>
  );
};

export default AuctionDiscountRateTrendGraphCard;
