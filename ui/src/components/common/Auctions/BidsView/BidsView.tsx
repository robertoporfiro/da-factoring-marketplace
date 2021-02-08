import { Id } from "@daml.js/da-marketplace/lib/DA/Finance/Types";
import { Buyer } from "@daml.js/da-marketplace/lib/Factoring/Buyer";
import { Auction, Bid } from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import { useLedger, useParty, useStreamFetchByKeys } from "@daml/react";
import { ContractId } from "@daml/types";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import BasePage, { IBasePageProps } from "../../../BasePage/BasePage";
import { useOperator } from "../../common";
import { FactoringRole } from "../../FactoringRole";
import {
  getAuctionMinPrice,
  getCurrentBestBid,
  sumOfAuctionInvoices,
} from "../../factoringUtils";
import { InputField } from "../../InputField/InputField";
import { useRegistryLookup } from "../../RegistryLookup";
import { SolidButton } from "../../SolidButton/SolidButton";
import {
  daysLeftFromDateString,
  decimalToPercent,
  decimalToPercentString,
  formatAsCurrency,
} from "../../utils";
import { useToasts } from "react-toast-notifications";
import "./BidsView.css";
interface BidsViewProps extends IBasePageProps {
  historicalView?: boolean;
  userRole: FactoringRole;
}
const BidsView: React.FC<BidsViewProps> = (props): JSX.Element => {
  const { addToast } = useToasts();
  const registry = useRegistryLookup();
  const history = useHistory();
  const ledger = useLedger();
  const buyer = useParty();
  const operator = useOperator();
  const handleChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const name = target.name;
    const value = target.value;

    if (name === "bidAmount") {
      let bidAmount = +value;
      if (bidAmount > placeBidFormAuctionAmount) {
        bidAmount = placeBidFormAuctionAmount;
      }
      setPlaceBidFormPrice(bidAmount / placeBidFormAuctionAmount);
    } else if (name === "auctionAmount") {
      const auctionAmount = +value;
      if (auctionAmount % (+auction?.bidIncrement ?? 1) !== 0) {
        target.setCustomValidity(
          "Auction amount must be a multiple of bid increment"
        );
      } else if (auctionAmount > sumOfAuctionInvoices(auction)) {
        target.setCustomValidity(
          "Auction amount must not be greater than invoice amount"
        );
      } else {
        target.setCustomValidity("");
        setPlaceBidFormAuctionAmount(auctionAmount);
      }
    } else if (name === "discount") {
      const discount = +value;
      if (!(discount > 0.0)) {
        target.setCustomValidity("Enter a valid discount rate");
      } else {
        target.setCustomValidity("");
        setPlaceBidFormPrice(1.0 - discount * 0.01);
      }
    }
  };

  const [placeBidFormAuctionAmount, setPlaceBidFormAuctionAmount] = useState(0);
  const [placeBidFormPrice, setPlaceBidFormPrice] = useState(1);
  const [currentBestBid, setCurrentBestBid] = useState("0 %");
  let { auctionContractId } = useParams<{ auctionContractId: string }>();
  const [auctionId, setAuctionId] = useState<Id>();

  useEffect(() => {
    const fetchAuction = async () => {
      const auctionContract = await ledger.fetch(
        Auction,
        auctionContractId as ContractId<Auction>
      );
      if (auctionContract) {
        setAuctionId(auctionContract.payload.id);
      }
    };
    if (!auctionId) {
      fetchAuction();
    }
  }, [auctionContractId, auctionId, ledger]);

  const auctionKeyQueryFactory = () => {
    if (auctionId) {
      return [auctionId];
    } else {
      return [];
    }
  };
  const auctionContractsByAuctionId = useStreamFetchByKeys(
    Auction,
    auctionKeyQueryFactory,
    [auctionId]
  ).contracts;
  const auction = useMemo(() => {
    if (auctionContractsByAuctionId[0]) {
      return auctionContractsByAuctionId[0].payload;
    }
  }, [auctionContractsByAuctionId]);
  const invoice = useMemo(() => {
    return auction?.invoices[0];
  }, [auction]);

  const bids = useMemo(
    () => auction?.bids.sort((a, b) => +b.price - +a.price) ?? [],
    [auction]
  );

  const historicalViewOnly = useMemo(() => {
    if (props.historicalView ?? false) {
      return true;
    } else {
      if (auction && auction.status === "AuctionOpen") {
        return false;
      } else {
        return true;
      }
    }
  }, [auction, props.historicalView]);

  useEffect(() => {
    if (placeBidFormAuctionAmount === 0 && invoice) {
      setPlaceBidFormAuctionAmount(+invoice?.amount ?? 0);
    } else if (auction) {
      if (+placeBidFormAuctionAmount < +auction.bidIncrement) {
        setPlaceBidFormAuctionAmount(+auction.bidIncrement);
      }
    }
  }, [auction, invoice, placeBidFormAuctionAmount]);

  useEffect(() => {
    if (auction) {
      setCurrentBestBid(
        decimalToPercentString(getCurrentBestBid(auction)?.price ?? 1.0)
      );
    }
  }, [auction]);

  const getExpectedReturn = () =>
    +(
      placeBidFormAuctionAmount -
      placeBidFormAuctionAmount * placeBidFormPrice
    ) || 0;

  const placeBid = async (
    auctionId: Id,
    bidAmount: number,
    auctionAmount: number
  ) => {
    await ledger.exerciseByKey(
      Buyer.Buyer_PlaceBid,
      { _1: operator, _2: buyer },
      {
        auctionId: auctionId,
        bidAmount: bidAmount.toFixed(2),
        auctionAmount: auctionAmount.toFixed(2),
      }
    );
  };
  const cancelBid = async (bid: Bid) => {
    try {
      await ledger.exerciseByKey(
        Buyer.Buyer_CancelBid,
        { _1: operator, _2: buyer },
        {
          bid: bid,
        }
      );
    } catch (e) {}
  };

  const onPlaceBidSubmit = async () => {
    if (placeBidFormAuctionAmount % +auction.bidIncrement !== 0) {
      addToast("Auction Amount must be a multiple", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    await placeBid(
      auction.id,
      placeBidFormAuctionAmount * placeBidFormPrice,
      placeBidFormAuctionAmount
    );
    setPlaceBidFormAuctionAmount(0);
    setPlaceBidFormPrice(1);
  };
  const bidsHeaders = (
      <tr>
        <th scope="col">Rate</th>
        <th scope="col">Auction Amount</th>
        <th scope="col">Bid Amount</th>
        {auction?.status === "AuctionClosed" && (
          <th scope="col">Quantity Filled</th>)}
        <th scope="col">Bidder Name</th>
        <th scope="col"></th>
      </tr>
  );

  const bidsList = bids.map((bid) => (
    <tr key={bid.orderId}>
      <td>
        <div>{decimalToPercentString(bid.price)}</div>
      </td>
      <td>{formatAsCurrency(+bid.amount)}</td>
      <td>{formatAsCurrency(+bid.amount * +bid.price)}</td>
      {auction.status === "AuctionClosed" && (
        <td>{formatAsCurrency(+bid.quantityFilled)}</td>
      )}
      <td>
        {bid.buyer === buyer ||
        props.userRole === FactoringRole.Exchange ||
        props.userRole === FactoringRole.CSD
          ? `${registry.buyerMap.get(bid.buyer).firstName} ${
              registry.buyerMap.get(bid.buyer).lastName
            }`
          : registry.buyerMap
              .get(bid.buyer)
              .firstName.replace(
                registry.buyerMap.get(bid.buyer).firstName.slice(1),
                "*".repeat(
                  registry.buyerMap.get(bid.buyer).firstName.length - 1
                )
              )}
      </td>
      <td>
        {bid.buyer === buyer && auction.status === "AuctionOpen" && (
          <SolidButton
            label="✖"
            className="cancel-bid-button"
            onClick={async () => {
              await cancelBid(bid);
            }}
          />
        )}
        {bid.status === "BidWon" && <div className="bid-won-tick">✓</div>}
      </td>
    </tr>
  ));

  const InvoiceDetailSection = (label, data) => (
    <div className="invoice-detail-section">
      <div className="invoice-detail-section-label">{label}</div>
      <div className="invoice-detail-section-data">{data}</div>
    </div>
  );
  const PlaceBidInfoItem = (label, data) => (
    <div className="place-bid-info-item">
      <div className="place-bid-info-item-label">{label}</div>
      <div className="place-bid-info-item-data">{data}</div>
    </div>
  );
  return (
    <BasePage activeRoute="" {...props}>
      <div className="page-subheader">
        <div className="page-subheader-text"> Place a Bid </div>
        <Link
          className="back-to-auction-link"
          to={"#"}
          onClick={(e) => {
            e.preventDefault();
            history.goBack();
          }}
        >
          ⟵ Back to All Auctions
        </Link>
      </div>
      <div
        className={`${
          historicalViewOnly ?? false
            ? "historical-bids-container"
            : "place-bid-container"
        }`}
      >
        <div className="invoice-details-card">
          <div className="invoice-details-card-header">Invoice Details</div>
          {[
            InvoiceDetailSection("Invoice #", invoice?.invoiceNumber),
            InvoiceDetailSection("Payor", invoice?.payer),
            InvoiceDetailSection(
              "Issue Date",
              new Date(invoice?.issueDate ?? "").toLocaleDateString()
            ),
            InvoiceDetailSection(
              "Due Date",
              new Date(invoice?.dueDate ?? "").toLocaleDateString()
            ),
            InvoiceDetailSection(
              "Amount",
              formatAsCurrency(invoice?.amount ?? 0)
            ),
            InvoiceDetailSection(
              "Bid Increment",
              formatAsCurrency(+auction?.bidIncrement)
            ),
            props.userRole !== FactoringRole.Buyer &&
              props.userRole !== FactoringRole.Broker &&
              InvoiceDetailSection(
                "Max Discount Rate",
                decimalToPercentString(getAuctionMinPrice(auction) ?? 1)
              ),
          ]}
        </div>
        {!(historicalViewOnly ?? false) && (
          <div className="place-bid-card">
            <div className="place-bid-info-section">
              {[
                PlaceBidInfoItem("Current Best Bid", currentBestBid),
                PlaceBidInfoItem(
                  "Auction End",
                  auction
                    ? daysLeftFromDateString(new Date(auction?.endDate))
                    : ""
                ),
              ]}
            </div>

            <form
              onSubmit={(e) => {
                onPlaceBidSubmit();
                e.preventDefault();
              }}
              className="place-bid-form"
            >
              <InputField
                required
                label="Auction Amount ($)"
                name="auctionAmount"
                placeholder="e.g. 100000"
                min={+auction?.bidIncrement ?? 0}
                max={sumOfAuctionInvoices(auction)}
                onChange={handleChange}
                value={placeBidFormAuctionAmount}
                debounceTimeout={2000}
              />
              <div className="bid-price-fields">
                <InputField
                  required
                  step="0.01"
                  type="number"
                  label="Discount Rate (%)"
                  name="discount"
                  placeholder="e.g. 5"
                  min="0"
                  max={decimalToPercent(
                    +auction?.minProceeds / +auction?.minQuantity ?? 1
                  ).toFixed(2)}
                  onChange={handleChange}
                  value={`${((1.0 - placeBidFormPrice) * 100).toFixed(2)}`}
                  debounceTimeout={2000}
                />
                <div className="or">
                  <div>or</div>
                </div>
                <InputField
                  required
                  label="Bid Amount ($)"
                  type="number"
                  name="bidAmount"
                  placeholder="e.g. 10000"
                  max={placeBidFormAuctionAmount ?? 0}
                  onChange={handleChange}
                  value={(
                    placeBidFormAuctionAmount * placeBidFormPrice
                  ).toFixed(2)}
                  debounceTimeout={2000}
                  step={auction?.bidIncrement ?? 0}
                />
              </div>
              <div className="expected-return-section">
                <div className="expected-return-section-label">
                  Expected Return
                </div>
                <div className="expected-return-section-data">
                  {formatAsCurrency(getExpectedReturn())}
                </div>
              </div>
              <SolidButton
                type="submit"
                className="place-bid-button"
                label="Place Bid"
              />
            </form>
          </div>
        )}
        <div className="bid-history-card table-container">
          <div className="bid-history-card-header">Bid History</div>
          <table className="base-table bid-history-table">
            <thead>
                {bidsHeaders}
            </thead>
            <tbody>{bidsList}</tbody>
          </table>
        </div>
      </div>
    </BasePage>
  );
};

export default BidsView;
