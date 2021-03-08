import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useLedger, useParty } from "@daml/react";

import { ContractId } from "@daml/types";
import { Auction } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import {
  BrokerCustomerBuyer,
  BrokerCustomerSeller,
} from "@daml.js/daml-factoring/lib/Factoring/Broker";
import { useOperator } from "../../common";

import BasePage, { IBasePageProps } from "../../../BasePage/BasePage";

import FilterList from "../../../../assets/FilterList.svg";
import ArrowDropDown from "../../../../assets/ArrowDropDown.svg";
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
  getBuyerNameFromRegistry,
  getCurrentBestBid,
  getCurrentBestBidParty,
  getSellerNameFromRegistry,
  isBrokerBuyerParticipatingInAuction,
  isBrokerParticipatingInAuction,
  isBrokerSellerParticipatingInAuction,
  roleCanBidOnAuctions,
} from "../../factoringUtils";

import "./AuctionsView.css";
import { useRegistryLookup } from "../../RegistryLookup";
import { useContractQuery } from "../../../../websocket/queryStream";
import { SelectField } from "../../SelectField/SelectField";

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
  showAdvancedFilters?: boolean;
}
const AuctionsView: React.FC<AuctionsViewProps> = (
  props: AuctionsViewProps
) => {
  const history = useHistory();
  const { path } = useRouteMatch();
  const registry = useRegistryLookup();
  const currentParty = useParty();
  const operator = useOperator();
  const ledger = useLedger();

  const allowedAuctionStatuses = [
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
  const [currentFilters, setCurrentFilters] = useState([
    ...allowedAuctionStatuses,
  ]);
  const [currentAdvancedFilters, setCurrentAdvancedFilters] = useState({
    sellerFilter: "sellerFilter-All",
    buyerFilter: "buyerFilter-All",
    participationFilter: "participationFilter-ShowAllAuctions",
  });
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [advancedFilterMenuOpen, setAdvancedFilterMenuOpen] = useState(false);

  const brokerBuyerQuery = useContractQuery(BrokerCustomerBuyer);
  const brokerBuyers = useMemo(() => {
    return brokerBuyerQuery.map((c) => c.contractData.brokerCustomer);
  }, [brokerBuyerQuery]);

  const brokerSellerQuery = useContractQuery(BrokerCustomerSeller);
  const brokerSellers = useMemo(() => {
    return brokerSellerQuery.map((c) => c.contractData.brokerCustomer);
  }, [brokerSellerQuery]);

  const auctionContracts = useContractQuery(Auction);

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
        const selfBids = bids.filter((x) => x.buyer === currentParty);
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
    [currentParty, props.userRole]
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
      contractData: Auction;
      contractId: ContractId<Auction>;
    }) => {
      return {
        ...auctionContract.contractData,
        contractId: auctionContract.contractId,
        bestBid: getCurrentBestBid(auctionContract.contractData),
        statusForParty: getAuctionStatus(auctionContract.contractData),
      };
    };
    const currentFilterFunction = (auction) => {
      let buyerCondition = true;
      let sellerCondition = true;
      let participationCondition = true;
      if (
        currentAdvancedFilters.buyerFilter &&
        currentAdvancedFilters.buyerFilter !== "buyerFilter-All"
      ) {
        buyerCondition = isBrokerBuyerParticipatingInAuction(
          auction,
          currentAdvancedFilters.buyerFilter
        );
      }
      if (
        currentAdvancedFilters.sellerFilter &&
        currentAdvancedFilters.sellerFilter !== "sellerFilter-All"
      ) {
        sellerCondition = isBrokerSellerParticipatingInAuction(
          auction,
          currentAdvancedFilters.sellerFilter
        );
      }
      if (
        currentAdvancedFilters.participationFilter &&
        currentAdvancedFilters.participationFilter ===
          "participationFilter-ShowOnlyParticipating"
      ) {
        participationCondition = isBrokerParticipatingInAuction(
          auction,
          currentParty
        );
      }
      return (
        buyerCondition &&
        sellerCondition &&
        participationCondition &&
        currentFilters.includes(auction.statusForParty)
      );
    };
    return auctionContracts
      .map(currentMapFunction)
      .filter(currentFilterFunction)
      .sort((a, b) => +new Date(b.endDate) - +new Date(a.endDate));
  }, [
    auctionContracts,
    currentAdvancedFilters.buyerFilter,
    currentAdvancedFilters.participationFilter,
    currentAdvancedFilters.sellerFilter,
    currentFilters,
    currentParty,
    getAuctionStatus,
  ]);

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
          +getCurrentBestBidParty(auction, currentParty)?.price *
            +getCurrentBestBidParty(auction, currentParty)?.amount
        )}
      </td>
      <td
        className={`${
          roleCanBidOnAuctions(props.userRole) ? "" : "table-hidden"
        }`}
      >
        {decimalToPercentString(
          getCurrentBestBidParty(auction, currentParty)?.price
        )}
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

  const filterMenuStatus = () =>
    filterMenuOpen ? "filter-menu-open" : "filter-menu-closed";

  const advancedFilterMenuStatus = () =>
    advancedFilterMenuOpen
      ? "advanced-filter-menu-open"
      : "advanced-filter-menu-closed";

  const handleFilterMenuChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const value = target.value as AuctionStatusEnum;
    if (target.checked) {
      if (!currentFilters.includes(value)) {
        setCurrentFilters([...currentFilters, value]);
      }
    } else {
      if (currentFilters.includes(value)) {
        setCurrentFilters(currentFilters.filter((status) => status !== value));
      }
    }
  };

  const filterMenuArea = (
    <div className="filter-menu-area">
      <button
        className="filter-menu-button"
        onClick={() => {
          setFilterMenuOpen(!filterMenuOpen);
        }}
      >
        <img alt="" src={FilterList}></img>
      </button>
      <div className={`filter-menu ${filterMenuStatus()}`}>
        {allowedAuctionStatuses.map((s) => (
          <div className="filter-menu-option">
            <input
              type="checkbox"
              value={s}
              name={s}
              id={`filter-${s}`}
              onChange={handleFilterMenuChange}
              checked={currentFilters.includes(s)}
            />
            <label htmlFor={`filter-${s}`}>{s}</label>
          </div>
        ))}
      </div>
    </div>
  );

  const handleAdvancedFiltersChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    setCurrentAdvancedFilters({
      ...currentAdvancedFilters,
      [name]: value,
    });
  };

  const advancedFilters = (
    <>
      <select
        className="input-field"
        name="participationFilter"
        onChange={handleAdvancedFiltersChange}
      >
        <option value="participationFilter-ShowAllAuctions">
          Show All Auctions
        </option>
        <option value="participationFilter-ShowOnlyParticipating">
          Show Only Participating
        </option>
      </select>
      <select
        className="input-field"
        name="sellerFilter"
        onChange={handleAdvancedFiltersChange}
      >
        <option value="sellerFilter-All">All Sellers</option>
        {brokerSellers.map((seller) => (
          <option key={seller} value={seller}>
            {getSellerNameFromRegistry(registry, seller)}
          </option>
        ))}
      </select>
      <select
        className="input-field"
        name="buyerFilter"
        onChange={handleAdvancedFiltersChange}
      >
        <option value="buyerFilter-All">All Buyers</option>
        {brokerBuyers.map((buyer) => (
          <option key={buyer} value={buyer}>
            {getBuyerNameFromRegistry(registry, buyer)}
          </option>
        ))}
      </select>
    </>
  );
  const advancedFilterMenuArea = (
    <div className="advanced-filter-menu-area">
      <button
        className={`advanced-filter-menu-button ${advancedFilterMenuStatus()}`}
        onClick={() => {
          setAdvancedFilterMenuOpen(!advancedFilterMenuOpen);
        }}
      >
        <div className="advanced-filter-menu-button-label">Sort By</div>
        <img
          className="advanced-filter-menu-button-arrow"
          alt=""
          src={ArrowDropDown}
        ></img>
      </button>
      <div className={`advanced-filter-menu ${advancedFilterMenuStatus()}`}>
        {advancedFilters}
      </div>
    </div>
  );

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
            <TransparentSelect
              label="Buyers"
              className="buyers-filter"
              onChange={handleAdvancedFiltersChange}
              name="buyerFilter"
            >
              <option value="buyerFilter-All">All Buyers</option>
              {brokerBuyers.map((buyer) => (
                <option key={buyer} value={buyer}>
                  {getBuyerNameFromRegistry(registry, buyer)}
                </option>
              ))}
            </TransparentSelect>
          )}
      </div>
      <div className="page-subheader">
        <div className="page-subheader-text"> Auctions </div>
        {(props.showAdvancedFilters ?? false) && (
          <>
            <div className="advanced-filters-area">
              {filterMenuArea}
              {<div className="advance-filters-select"> {advancedFilters}</div>}
              {advancedFilterMenuArea}
            </div>
          </>
        )}
      </div>
      {props.userRole === FactoringRole.Buyer && BuyerGraphs}
      {(props.showSortSelector ?? true) && (
        <div className="auction-status-sort-selector-list">
          {allowedAuctionStatuses.map((filter) => (
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
