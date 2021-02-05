import { Auction } from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { ContractId } from "@daml/types";
import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useHistory, useRouteMatch } from "react-router-dom";
import BasePage, { IBasePageProps } from "../../../BasePage/BasePage";
import { useOperator } from "../../common";
import { FactoringRole } from "../../FactoringRole";
import { TransparentSelect } from "../../TransparentSelect/TransparentSelect";
import { decimalToPercentString, formatAsCurrency } from "../../utils";
import { OutlineButton } from "../../OutlineButton/OutlineButton";

import AuctionsProfitLossGraphCard from "../Graphs/AuctionsProfitLossGraphCard/AuctionsProfitLossGraphCard";
import AuctionWinsGraphCard from "../Graphs/AuctionWinsGraphCard/AuctionWinsGraphCard";
import IncomingPaymentsGraphCard from "../Graphs/IncomingPaymentsGraphCard/IncomingPaymentsGraphCard";
import TotalInvoicesValueGraphCard from "../Graphs/TotalInvoiceValueGraphCard/TotalInvoicesValueGraphCard";

import {
  endAuction,
  getCurrentBestBid,
  getCurrentBestBidParty,
} from "../../factoringUtils";

import "./AuctionsView.css";

export enum AuctionStatusEnum {
  Won = "Won",
  Live = "Live",
  Lost = "Lost",
  Closed = "Closed",
  Failed = "Failed",
}
interface AuctionsViewProps extends IBasePageProps {
  userRole?: FactoringRole;
  showSortSelector?: boolean;
}
const AuctionsView: React.FC<AuctionsViewProps> = (
  props: AuctionsViewProps
) => {
  const party = useParty();
  const operator = useOperator();
  const ledger = useLedger();
  const history = useHistory();
  const { path } = useRouteMatch();
  const [auctionSortStatus, setAuctionSortStatus] = useState(true);
  const buyer = useParty();
  const auctionContracts = useStreamQueries(Auction).contracts;

  const auctions = useMemo(() => {
    const currentMapFunction = (auctionContract: {
      payload: Auction;
      contractId: ContractId<Auction>;
    }) => {
      return {
        ...auctionContract.payload,
        contractId: auctionContract.contractId,
        bestBid: getCurrentBestBid(auctionContract.payload),
      };
    };
    return auctionContracts
      .map(currentMapFunction)
      .sort((a, b) => +new Date(b.endDate) - +new Date(a.endDate));
  }, [auctionContracts]);

  const buyerLastBidAuction = (auction: Auction) =>
    auction.bids.filter((bid) => bid.buyer === buyer)[0];

  const getAuctionStatus = (auction: Auction) => {
    if (auction.status === "AuctionOpen") {
      return AuctionStatusEnum.Live;
    } else {
      if (
        props.userRole === FactoringRole.Exchange ||
        props.userRole === FactoringRole.CSD
      ) {
        if (auction.status === "AuctionFailed") {
          return AuctionStatusEnum.Failed;
        } else {
          return AuctionStatusEnum.Closed;
        }
      }
      const bids = auction.bids;
      const selfBids = bids.filter((x) => x.buyer === buyer);
      if (selfBids.length === 0) {
        return AuctionStatusEnum.Closed;
      }
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
        <tr key={JSON.stringify(auction.id)}>
          <td>
            <div
              className={`auction-status auction-status-${getAuctionStatus(
                auction
              ).toString()}`}
            >
              {getAuctionStatus(auction).toString()}
            </div>
          </td>
          <td>{auction.invoices[0]?.invoiceNumber ?? 0}</td>
          <td>{auction.invoices[0]?.payer ?? 0}</td>
          <td>{formatAsCurrency(Number(auction.invoices[0]?.amount ?? 0))}</td>
          <td>
            {formatAsCurrency(
              (+auction.bestBid?.amount ?? 0) * (+auction.bestBid?.price ?? 1)
            )}
          </td>
          <td>{decimalToPercentString(+(auction.bestBid?.price ?? "1"))}</td>
          <td
            className={`${
              props.userRole && props.userRole !== FactoringRole.Buyer
                ? "table-hidden"
                : ""
            }`}
          >
            {formatAsCurrency(
              +getCurrentBestBidParty(auction, buyer)?.price *
                +getCurrentBestBidParty(auction, buyer)?.amount
            )}
          </td>
          <td
            className={`${
              props.userRole && props.userRole !== FactoringRole.Buyer
                ? "table-hidden"
                : ""
            }`}
          >
            {decimalToPercentString(
              getCurrentBestBidParty(auction, buyer)?.price ?? 1
            )}
          </td>
          <td>{new Date(auction.endDate).toLocaleDateString()}</td>
          <td>
            <div className="auction-actions-cell">
              {
                <OutlineButton
                  label={`${
                    props.userRole &&
                    props.userRole === FactoringRole.Buyer &&
                    auction.status === "AuctionOpen"
                      ? "Place Bid"
                      : "View Details"
                  }`}
                  className="auctions-bids-view-button"
                  onClick={() => history.push(`${path}/${auction.contractId}`)}
                />
              }
              {props.userRole && props.userRole === FactoringRole.Exchange && (
                <OutlineButton
                  disabled={auction.status !== "AuctionOpen"}
                  className="auctions-end-auction-button"
                  label={"End Auction"}
                  onClick={async () => {
                    await endAuction(ledger, auction);
                  }}
                />
              )}
            </div>
          </td>
        </tr>
      ))
    : [];

  const BuyerGraphs = (
    <div className="buyer-graphs-container">
      <AuctionsProfitLossGraphCard auctions={auctions} />
      <TotalInvoicesValueGraphCard auctions={auctions} />
      {/* <AuctionWinsGraphCard auctions={auctions} />
      <IncomingPaymentsGraphCard auctions={auctions} />
      */}
    </div>
  );
  return (
    <BasePage {...props}>
      <div>
        {props.userRole && props.userRole === FactoringRole.Broker && (
          <TransparentSelect label="Buyers" className="buyers-select">
            <option value="Test">Jonathan Malka</option>
          </TransparentSelect>
        )}
      </div>
      <div className="page-subheader">
        <div className="page-subheader-text"> Auctions </div>
      </div>
      {props.userRole === FactoringRole.Buyer && BuyerGraphs}
      {(!props.userRole || props.userRole !== FactoringRole.Broker) &&
        (props.showSortSelector ?? true) && (
          <div className="invoice-status-sort-selector-list">
            <button
              className="invoice-status-sort-selector"
              onClick={() => setAuctionSortStatus(!auctionSortStatus)}
            >
              <div
                className={`invoice-status-sort-selected-${auctionSortStatus}`}
              >
                ✓
              </div>
              Live
            </button>
            {/*
            <button className="invoice-status-sort-selector">
              <div className="invoice-status-sort-selected-true">✓</div>
              Winning
            </button>
            <button className="invoice-status-sort-selector">
              <div className="invoice-status-sort-selected-true">✓</div>
              Outbid
            </button>
            */}
            <button className="invoice-status-sort-selector">
              <div className="invoice-status-sort-selected-true">✓</div>
              Won
            </button>
            <button className="invoice-status-sort-selector">
              <div className="invoice-status-sort-selected-true">✓</div>
              Lost
            </button>
          </div>
        )}

      <div className="buyer-auction-table-container">
        <table className="base-table buyer-invoices-table">
          <thead>
            <tr>
              <th scope="col">Status</th>
              <th scope="col">Invoice #</th>
              <th scope="col">Payor</th>
              <th scope="col">Amount</th>
              <th scope="col">Best Bid (Qty.)</th>
              <th>Best Bid (%)</th>
              <th
                scope="col"
                className={`${
                  props.userRole && props.userRole !== FactoringRole.Buyer
                    ? "table-hidden"
                    : ""
                }`}
              >
                My Best Bid (Qty.)
              </th>
              <th
                scope="col"
                className={`${
                  props.userRole && props.userRole !== FactoringRole.Buyer
                    ? "table-hidden"
                    : ""
                }`}
              >
                My Best Bid (%)
              </th>
              <th scope="col">Expiry Date</th>
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
