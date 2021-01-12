import {
  Auction,
  AuctionStatus,
} from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import { useParty, useStreamQueries } from "@daml/react";
import { ContractId } from "@daml/types";
import React, { useMemo, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { useHistory, useRouteMatch } from "react-router-dom";
import BasePage, { IBasePageProps } from "../../BasePage/BasePage";
import { decimalToPercentString, formatAsCurrency } from "../utils";

import "./AuctionsView.css";

export enum AuctionStatusEnum {
  Won = "Won",
  Live = "Live",
  Lost = "Lost",
}

const AuctionsView: React.FC<IBasePageProps> = (props: IBasePageProps) => {
  const history = useHistory();
  const { path } = useRouteMatch();
  const [auctionSortStatus, setAuctionSortStatus] = useState(true);

  const buyer = useParty();
  const auctionContracts = useStreamQueries(
    Auction,
    () => [],
    [],
    (e) => {
      console.log("Unexpected close from Auction: ", e);
    }
  ).contracts;

  const auctions = useMemo(() => {
    const currentMapFunction = (auctionContract: {
      payload: Auction;
      contractId: ContractId<Auction>;
    }) => {
      return {
        ...auctionContract.payload,
        contractId: auctionContract.contractId,
        highestBid:
          auctionContract.payload.bids
            .flatMap((x) => Number(+x.amount * +x.price))
            .sort()
            .reverse()[0] ?? 0,
      };
    };
    return auctionContracts.map(currentMapFunction);
  }, [auctionContracts]);

  const sumOfAuctionInvoiceAmounts = () =>
    auctions.flatMap((x) => x.invoices).reduce((a, b) => a + +b.amount, 0);
  const sumOfAuctionHighestBids = () =>
    auctions.reduce((a, b) => a + +b.highestBid, 0);
  const buyerLastBidAuction = (auction: Auction) =>
    auction.bids.filter((bid) => bid.buyer === buyer)[0];

  const getAuctionStatus = (auction: Auction) => {
    if (auction.status === "AuctionOpen") {
      return AuctionStatusEnum.Live;
    } else {
      const bids = auction.bids;
      const selfBids = bids.filter((x) => x.buyer === buyer);
      const winningBid = selfBids.find((x) => x.status === "BidWon");
      const losingBid = selfBids.find((x) => x.status === "BidLost");
      if (winningBid) {
        return AuctionStatusEnum.Won;
      } else {
        return AuctionStatusEnum.Lost;
      }
    }
  };
  const auctionList = auctionSortStatus
    ? auctions.map((auction) => (
        <tr key={auction.invoices[0].invoiceNumber}>
          <td>
            <div
              className={`auction-status auction-status-${getAuctionStatus(
                auction
              ).toString()}`}
            >
              {getAuctionStatus(auction).toString()}
            </div>
          </td>
          <td>{auction.invoices[0].invoiceNumber}</td>
          <td>{auction.invoices[0].payer}</td>
          <td>{formatAsCurrency(Number(auction.invoices[0].amount))}</td>
          <td>{formatAsCurrency(auction?.highestBid)}</td>
          <td>
            {decimalToPercentString(buyerLastBidAuction(auction)?.price ?? 1)}
          </td>
          <td>
            {formatAsCurrency(
              +buyerLastBidAuction(auction)?.amount *
                +buyerLastBidAuction(auction)?.price
            )}
          </td>
          <td>{new Date(auction.createdAt).toLocaleDateString()}</td>
          <td>
            <button
              className="outline-button"
              onClick={() =>
                history.push(`${path}/placebid/${auction.contractId}`)
              }
              disabled={auction.status === "AuctionClosed"}
            >
              Place Bid
            </button>
          </td>
        </tr>
      ))
    : [];

  const data1 = {
    datasets: [
      {
        borderWidth: 0,
        data: [sumOfAuctionInvoiceAmounts()],
        backgroundColor: ["#ffa726", "#8d63cc", "#7bc5f1"],
      },
    ],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: ["Purchased", "Winning", "Bidding"],
  };
  const graph2Data = {
    datasets: [
      {
        borderWidth: 0,
        data: [sumOfAuctionHighestBids(), sumOfAuctionInvoiceAmounts()],
        backgroundColor: ["#ffa726", "#7bc5f1"],
      },
    ],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: ["Highest Bids", "Total Invoice Amount", "Bidding"],
  };
  const graph1Data = {
    datasets: [
      {
        borderWidth: 0,
        data: [
          sumOfAuctionHighestBids(),
          sumOfAuctionInvoiceAmounts(),
          sumOfAuctionHighestBids(),
        ],
        backgroundColor: ["#ffa726", "#7bc5f1", "#8d63cc"],
      },
    ],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: ["Purchased", "Winning", "Bidding"],
  };
  let data2 = {
    datasets: [
      {
        borderWidth: 0,
        data: [20, 20, 20],
        backgroundColor: ["#ffa726", "#8d63cc", "#7bc5f1"],
      },
    ],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: ["1", "2", "3"],
  };
  const buyerGraphsContainer = (
    <div className="buyer-graphs-container">
      <div className="buyer-graph-card">
        <div className="buyer-graph-card-header">
          Total Invoice Notional Value
        </div>

        <div className="buyer-graph-container">
          <Doughnut
            data={graph1Data}
            options={{
              responsive: true,
              aspectRatio: 1,
              maintainAspectRatio: false,
              legend: { display: false },
            }}
          />
        </div>
        <div className="buyer-graph-legend">
          <div className="buyer-graph-legend-item">
            <div className="buyer-graph-legend-indicator-Blue"></div>
            <div className="buyer-graph-legend-label">Purchased</div>
            <div className="buyer-graph-legend-data">
              {formatAsCurrency(sumOfAuctionInvoiceAmounts())}
            </div>
          </div>
          <div className="buyer-graph-legend-item">
            <div className="buyer-graph-legend-indicator-Orange"></div>
            <div className="buyer-graph-legend-label">Winning</div>
            <div className="buyer-graph-legend-data">
              {formatAsCurrency(sumOfAuctionHighestBids())}
            </div>
          </div>
          <div className="buyer-graph-legend-item">
            <div className="buyer-graph-legend-indicator-Purple"></div>
            <div className="buyer-graph-legend-label">Bidding</div>
            <div className="buyer-graph-legend-data">
              {formatAsCurrency(sumOfAuctionHighestBids())}
            </div>
          </div>
        </div>
      </div>
      <div className="buyer-graph-card">
        <div className="buyer-graph-card-header">Projected P&amp;L</div>
        <div className="buyer-graph-container">
          <Doughnut
            data={graph2Data}
            options={{
              responsive: true,
              aspectRatio: 1,
              maintainAspectRatio: false,
              legend: { display: false },
            }}
          />
        </div>
        <div className="buyer-graph-legend">
          <div className="buyer-graph-legend-item">
            <div className="buyer-graph-legend-indicator-Blue"></div>
            <div className="buyer-graph-legend-label">Total Invoice Amount</div>
            <div className="buyer-graph-legend-data">
              {formatAsCurrency(sumOfAuctionInvoiceAmounts())}
            </div>
          </div>
          <div className="buyer-graph-legend-item">
            <div className="buyer-graph-legend-indicator-Orange"></div>
            <div className="buyer-graph-legend-label">Highest Bid</div>
            <div className="buyer-graph-legend-data">
              {formatAsCurrency(sumOfAuctionHighestBids())}
            </div>
          </div>
        </div>
      </div>
      {/*
        <>
          <div className="buyer-graph-card">
            <div className="buyer-graph-card-header">Auction Wins</div>
            <div className="buyer-graph-container">
              <Bar
                data={data2}
                options={{
                  scales: {
                    xAxes: [
                      {
                        gridLines: {
                          display: false,
                        },
                      },
                    ],
                    yAxes: [
                      {
                        gridLines: {
                          display: false,
                        },
                      },
                    ],
                  },
                  legend: { display: false },
                }}
              ></Bar>
            </div>
          </div>
          <div className="buyer-graph-card">
            <div className="buyer-graph-card-header">Receivables</div>
            <div className="buyer-graph-container">
              <Bar
                data={data2}
                options={{
                  scales: {
                    xAxes: [
                      {
                        gridLines: {
                          display: false,
                        },
                      },
                    ],
                    yAxes: [
                      {
                        gridLines: {
                          display: false,
                        },
                      },
                    ],
                  },
                  legend: { display: false },
                }}
              ></Bar>
            </div>
          </div>
        </>
        */}
    </div>
  );
  return (
    <BasePage {...props}>
      <div className="page-subheader">
        <div className="page-subheader-text"> Auctions </div>
      </div>
      {/*buyerGraphsContainer*/}
      <div className="invoice-status-sort-selector-list">
        <button
          className="invoice-status-sort-selector"
          onClick={() => setAuctionSortStatus(!auctionSortStatus)}
        >
          <div className={`invoice-status-sort-selected-${auctionSortStatus}`}>
            ✓
          </div>
          Live
        </button>
        <button className="invoice-status-sort-selector">
          <div className="invoice-status-sort-selected-true">✓</div>
          Winning
        </button>
        <button className="invoice-status-sort-selector">
          <div className="invoice-status-sort-selected-true">✓</div>
          Outbid
        </button>
        <button className="invoice-status-sort-selector">
          <div className="invoice-status-sort-selected-true">✓</div>
          Won
        </button>
        <button className="invoice-status-sort-selector">
          <div className="invoice-status-sort-selected-true">✓</div>
          Lost
        </button>
      </div>
      <div className="buyer-auction-table-container">
        <table className="base-table buyer-invoices-table">
          <thead>
            <tr>
              <th scope="col">Status</th>
              <th scope="col">Invoice No.</th>
              <th scope="col">Payor</th>
              <th scope="col">Amount</th>
              <th scope="col">Highest Bid</th>
              <th scope="col">Discount</th>
              <th scope="col">My Bid</th>
              <th scope="col">Date</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>{auctionList}</tbody>
        </table>
      </div>
    </BasePage>
  );
};

export default AuctionsView;
