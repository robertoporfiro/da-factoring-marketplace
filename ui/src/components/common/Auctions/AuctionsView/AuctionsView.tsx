import React, { useCallback, useMemo, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useLedger, useParty, useStreamQueries } from "@daml/react";

import { ContractId } from "@daml/types";
import { Auction } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import { BrokerCustomerBuyer } from "@daml.js/daml-factoring/lib/Factoring/Broker";

import BasePage, { IBasePageProps } from "../../../BasePage/BasePage";
import { useOperator } from "../../common";
import { FactoringRole } from "../../FactoringRole";
import { TransparentSelect } from "../../TransparentSelect/TransparentSelect";
import { decimalToPercentString, formatAsCurrency } from "../../utils";
import { OutlineButton } from "../../OutlineButton/OutlineButton";

import AuctionsProfitLossGraphCard from "../Graphs/AuctionsProfitLossGraphCard/AuctionsProfitLossGraphCard";
/*
import AuctionWinsGraphCard from "../Graphs/AuctionWinsGraphCard/AuctionWinsGraphCard";
import IncomingPaymentsGraphCard from "../Graphs/IncomingPaymentsGraphCard/IncomingPaymentsGraphCard";
*/
import TotalInvoicesValueGraphCard from "../Graphs/TotalInvoiceValueGraphCard/TotalInvoicesValueGraphCard";

import {
  encodeAuctionIdPayload,
  endAuction,
  getBidderNameFromRegistry,
  getCurrentBestBid,
  getCurrentBestBidParty,
  roleCanBidOnAuctions,
} from "../../factoringUtils";

import "./AuctionsView.css";
import { useRegistryLookup } from "../../RegistryLookup";

export enum AuctionStatusEnum {
  Won = "Won",
  Live = "Live",
  Lost = "Lost",
  Closed = "Closed",
  Failed = "Failed",
}
interface AuctionsViewProps extends IBasePageProps {
  showSortSelector?: boolean;
  showBuyersFilter?: boolean;
}
const AuctionsView: React.FC<AuctionsViewProps> = (
  props: AuctionsViewProps
) => {
  const registry = useRegistryLookup();
  const currentParty = useParty();
  const operator = useOperator();
  const ledger = useLedger();
  const history = useHistory();
  const { path } = useRouteMatch();

  const brokerBuyerQuery = useStreamQueries(BrokerCustomerBuyer);
  const brokerBuyers = useMemo(() => {
    return brokerBuyerQuery.contracts.map((c) => c.payload.brokerCustomer);
  }, [brokerBuyerQuery]);
  const buyer = useParty();
  const auctionContracts = useStreamQueries(Auction).contracts;
  const allowedFilters = [
    AuctionStatusEnum.Live,
    ...(props.userRole !== FactoringRole.CSD &&
    props.userRole !== FactoringRole.Exchange
      ? [AuctionStatusEnum.Won]
      : []),
    ...(props.userRole !== FactoringRole.CSD &&
    props.userRole !== FactoringRole.Exchange
      ? [AuctionStatusEnum.Lost]
      : []),
    AuctionStatusEnum.Closed,
    ...(props.userRole === FactoringRole.CSD ||
    props.userRole === FactoringRole.Exchange
      ? [AuctionStatusEnum.Failed]
      : []),
  ];
  const [currentFilters, setCurrentFilters] = useState([...allowedFilters]);

  const getAuctionStatus = useCallback(
    (auction: Auction) => {
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
        if (winningBid) {
          return AuctionStatusEnum.Won;
        } else {
          return AuctionStatusEnum.Lost;
        }
      }
    },
    [buyer, props.userRole]
  );

  const getAuctionsSumByStatus = (status: AuctionStatusEnum) => {
    return auctions
      .filter((x) => x.statusForParty === status)
      .map((a) => +a.invoice?.amount ?? 0)
      .reduce((a, b) => a + b, 0);
  };

  const getNumberOfAuctionsByStatus = (status: AuctionStatusEnum) => {
    return auctions.filter((x) => x.statusForParty === status).length;
  };

  const auctions = useMemo(() => {
    const currentMapFunction = (auctionContract: {
      payload: Auction;
      contractId: ContractId<Auction>;
    }) => {
      return {
        ...auctionContract.payload,
        contractId: auctionContract.contractId,
        bestBid: getCurrentBestBid(auctionContract.payload),
        statusForParty: getAuctionStatus(auctionContract.payload),
      };
    };
    const currentFilterFunction = (auction) => {
      return currentFilters.indexOf(auction.statusForParty) !== -1;
    };
    return auctionContracts
      .map(currentMapFunction)
      .filter(currentFilterFunction)
      .sort((a, b) => +new Date(b.endDate) - +new Date(a.endDate));
  }, [auctionContracts, currentFilters, getAuctionStatus]);

  const auctionList = auctions.map((auction) => (
    <tr key={auction.invoice.invoiceId + auction.id.label}>
      <td>
        <div
          className={`auction-status auction-status-${auction.statusForParty.toString()}`}
        >
          {auction.statusForParty.toString()}
        </div>
      </td>
      <td>{auction.invoice?.invoiceNumber ?? 0}</td>
      <td>{auction.invoice?.payer ?? 0}</td>
      <td>{formatAsCurrency(+(auction.invoice?.amount ?? 0))}</td>
      <td>
        {formatAsCurrency(
          (+auction.bestBid?.amount ?? 0) * (+auction.bestBid?.price ?? 1)
        )}
      </td>
      <td>{decimalToPercentString(+(auction.bestBid?.price ?? "1"))}</td>
      <td
        className={`${
          roleCanBidOnAuctions(props.userRole) ? "" : "table-hidden"
        }`}
      >
        {formatAsCurrency(
          +getCurrentBestBidParty(auction, buyer)?.price *
            +getCurrentBestBidParty(auction, buyer)?.amount
        )}
      </td>
      <td
        className={`${
          roleCanBidOnAuctions(props.userRole) ? "" : "table-hidden"
        }`}
      >
        {decimalToPercentString(getCurrentBestBidParty(auction, buyer)?.price)}
      </td>
      <td>{new Date(auction.endDate).toLocaleDateString()}</td>
      <td>
        <div className="auction-actions-cell">
          {
            <OutlineButton
              label={`${
                roleCanBidOnAuctions(props.userRole) &&
                auction.status === "AuctionOpen"
                  ? "Place Bid"
                  : "View Details"
              }`}
              className="auctions-bids-view-button"
              onClick={() => {
                const lastSegment = path.substring(path.lastIndexOf("/"));
                if (lastSegment !== "auctions")
                  history.push(
                    `${path.replace(
                      lastSegment,
                      "/auctions"
                    )}/${encodeAuctionIdPayload(auction as Auction)}`
                  );
              }}
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
  ));

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
        {props.showBuyersFilter &&
          props.userRole &&
          props.userRole === FactoringRole.Broker && (
            <TransparentSelect label="Buyers" className="buyers-filter">
              <option value="currentBuyer-filter-All">All</option>
              {brokerBuyers.map((b) => (
                <option value={b}>
                  {getBidderNameFromRegistry(registry, b, false)}
                </option>
              ))}
            </TransparentSelect>
          )}
      </div>
      <div className="page-subheader">
        <div className="page-subheader-text"> Auctions </div>
      </div>
      {props.userRole === FactoringRole.Buyer && BuyerGraphs}
      {(props.showSortSelector ?? true) && (
        <div className="auction-status-sort-selector-list">
          {allowedFilters.map((filter) => (
            <button
              key={filter}
              className="auction-status-sort-selector"
              onClick={() => {
                if (currentFilters.indexOf(filter) !== -1) {
                  setCurrentFilters(currentFilters.filter((f) => f !== filter));
                } else {
                  setCurrentFilters([...currentFilters, filter]);
                }
              }}
            >
              <div
                className={`auction-status-sort-selected-${
                  currentFilters.indexOf(filter) !== -1
                }`}
              >
                ✓
              </div>
              <div className="auction-status-sort-selector-contents">
                <div className="auction-status-sort-selector-label">
                  {filter.toString()}
                </div>
                <div className="auction-status-sort-selector-contents-stats">{`${getNumberOfAuctionsByStatus(
                  filter
                )} | ${formatAsCurrency(getAuctionsSumByStatus(filter))}`}</div>
              </div>
            </button>
          ))}
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
                  props.userRole &&
                  props.userRole !== FactoringRole.Buyer &&
                  props.userRole !== FactoringRole.Broker
                    ? "table-hidden"
                    : ""
                }`}
              >
                My Best Bid (Qty.)
              </th>
              <th
                scope="col"
                className={`${
                  props.userRole &&
                  props.userRole !== FactoringRole.Buyer &&
                  props.userRole !== FactoringRole.Broker
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
