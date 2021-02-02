import { Id } from "@daml.js/da-marketplace/lib/DA/Finance/Types";
import { Buyer } from "@daml.js/da-marketplace/lib/Factoring/Buyer";
import { Auction, Bid } from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import {
  useLedger,
  useParty,
  useStreamFetchByKeys,
  useStreamQueries,
} from "@daml/react";
import { ContractId } from "@daml/types";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import BasePage from "../../BasePage/BasePage";
import { useOperator } from "../../common/common";
import { InputField } from "../../common/InputField/InputField";
import { SolidButton } from "../../common/SolidButton/SolidButton";
import {
  daysLeftFromDateString,
  decimalToPercent,
  decimalToPercentString,
  formatAsCurrency,
} from "../../common/utils";
import "./PlaceBid.css";

const BuyerPlaceBid: React.FC = (): JSX.Element => {
  const ledger = useLedger();
  const buyer = useParty();
  const operator = useOperator();
  const handlePlaceBidFormAuctionAmountChange = (e: ChangeEvent) => {
    setPlaceBidFormAuctionAmount(+(e.target as HTMLInputElement).value);
  };
  const handlePlaceBidFormDiscountChange = (e: ChangeEvent) => {
    const value = +(e.target as HTMLInputElement).value;
    setPlaceBidFormPrice(1.0 - value * 0.01);
  };
  const handlePlaceBidFormBidAmountChange = (e: ChangeEvent) => {
    const value = +(e.target as HTMLInputElement).value;
    setPlaceBidFormPrice(value / placeBidFormAuctionAmount);
  };
  const [placeBidFormAuctionAmount, setPlaceBidFormAuctionAmount] = useState(0);
  const [placeBidFormPrice, setPlaceBidFormPrice] = useState(1);
  const [currentBestBid, setCurrentBestBid] = useState("0 %");
  const [currentEditingBid, setCurrentEditingBid] = useState<Bid>();
  let { auctionContractId } = useParams<{ auctionContractId: string }>();
  const [auctionId, setAuctionId] = useState<Id>();

  const buyerContracts = useStreamQueries(
    Buyer,
    () => [],
    [],
    (e) => {
      console.log("Unexpected close from Buyer: ", e);
    }
  ).contracts;
  const buyerContract = buyerContracts[0];

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
    () =>
      auction?.bids.sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
      ) ?? [],
    [auction]
  );

  useEffect(() => {
    if (placeBidFormAuctionAmount === 0 && invoice) {
      setPlaceBidFormAuctionAmount(+invoice?.amount ?? 0);
    } else if (auction) {
      if (+placeBidFormAuctionAmount < +auction.minQuantity) {
        setPlaceBidFormAuctionAmount(+auction.minQuantity);
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

  const getCurrentBestBid = (auction) =>
    auction.bids
      ? auction.bids.sort((b, a) => +a.price - +b.price)[0]
      : { price: 1.0 };

  const placeBid = async (auctionId: Id, amount: number, price: number) => {
    await ledger.exerciseByKey(
      Buyer.Buyer_PlaceBid,
      { _1: operator, _2: buyer },
      {
        auctionId: auctionId,
        price: price.toFixed(2),
        bidAmount: amount.toFixed(),
      }
    );
  };
  const updateBid = async (
    bidToUpdate: Bid,
    newAmount: number,
    newPrice: number
  ) => {
    await ledger.exerciseByKey(
      Buyer.Buyer_UpdateBid,
      { _1: operator, _2: buyer },
      {
        bid: bidToUpdate,
        newPrice: newPrice.toFixed(2),
        newAmount: newAmount.toFixed(),
      }
    );
  };
  const onPlaceBidSubmit = async () => {
    try {
      if (!currentEditingBid) {
        await placeBid(
          auction.id,
          +(+placeBidFormAuctionAmount * +placeBidFormPrice).toFixed(0),
          placeBidFormPrice
        );
      } else {
        await updateBid(
          currentEditingBid,
          +(+placeBidFormAuctionAmount * +placeBidFormPrice).toFixed(0),
          placeBidFormPrice
        );
        setCurrentEditingBid(null);
      }
    } catch (e) {}
    //history.goBack();
  };
  const onBidEdit = async (bid: Bid) => {
    setCurrentEditingBid(bid);
    setPlaceBidFormAuctionAmount(+(+bid.amount).toFixed(0));
    setPlaceBidFormPrice(+bid.price);
  };
  const bidsList = bids
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .map((bid) => (
      <tr key={bid.createdAt}>
        <td className="edit-bid-cell">
          <div>{decimalToPercentString(bid.price)}</div>
          {bid.buyer === buyer && (
            <SolidButton
              label="✎"
              className="edit-bid-button"
              onClick={() => {
                onBidEdit(bid);
              }}
            />
          )}
        </td>
        <td>{formatAsCurrency(+bid.amount)}</td>
        <td>{formatAsCurrency(+bid.amount * +bid.price)}</td>
        <td>
          {bid.buyer === buyer
            ? bid.buyer
            : bid.buyer.replace(
                bid.buyer.slice(1),
                "*".repeat(bid.buyer.length - 1)
              )}
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
    <BasePage activeRoute="">
      <div className="page-subheader">
        <div className="page-subheader-text"> Place a Bid </div>
        <Link className="back-to-auction-link" to={"../../buyer"}>
          ⟵ Back to All Auctions
        </Link>
      </div>
      <div className="place-bid-container">
        <div className="invoice-details-card">
          <div className="invoice-details-card-header">Invoice Details</div>
          {[
            InvoiceDetailSection("Invoice #", invoice?.invoiceNumber),
            InvoiceDetailSection("Payer", invoice?.payer),
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
              "Min Bid Increment",
              formatAsCurrency(+auction?.bidIncrement)
            ),
          ]}
        </div>
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
          <div className="place-bid-form">
            <InputField
              label="Auction Amount ($)"
              name="auctionAmount"
              placeholder="e.g. 100000"
              onChange={handlePlaceBidFormAuctionAmountChange}
              value={placeBidFormAuctionAmount}
              debounceTimeout={300}
            />
            <div className="bid-price-fields">
              <InputField
                type="number"
                label="Discount Rate (%)"
                name="discount"
                placeholder="e.g. 5"
                min="0"
                max={decimalToPercent(
                  +auction?.minProceeds / +auction?.minQuantity ?? 1
                ).toFixed(1)}
                onChange={handlePlaceBidFormDiscountChange}
                value={`${((1.0 - placeBidFormPrice) * 100).toFixed(1)}`}
                debounceTimeout={300}
              />
              <div className="or">
                <div>or</div>
              </div>
              <InputField
                label="Bid Amount ($)"
                name="bidAmount"
                placeholder="e.g. 10000"
                onChange={handlePlaceBidFormBidAmountChange}
                value={placeBidFormAuctionAmount * placeBidFormPrice}
                debounceTimeout={300}
              />
            </div>
            <div className="expected-return-section">
              <div className="expected-return-section-label">
                Expected Return
              </div>
              <div className="expected-return-section-data">
                {formatAsCurrency(
                  +(
                    placeBidFormAuctionAmount -
                    placeBidFormAuctionAmount * placeBidFormPrice
                  ) || 0
                )}
              </div>
            </div>
            <SolidButton
              className="place-bid-button"
              label={`${currentEditingBid ? "Edit Bid" : "Place Bid"}`}
              onClick={onPlaceBidSubmit}
            />
          </div>
        </div>
        <div className="bid-history-card table-container">
          <div className="bid-history-card-header">Bid History</div>
          <table className="base-table bid-history-table">
            <thead>
              <tr>
                <th scope="col">Rate</th>
                <th scope="col">Auction Amount</th>
                <th scope="col">Bid Amount</th>
                <th scope="col">Bidder Name</th>
              </tr>
            </thead>
            <tbody>{bidsList}</tbody>
          </table>
        </div>
      </div>
    </BasePage>
  );
};

export default BuyerPlaceBid;
