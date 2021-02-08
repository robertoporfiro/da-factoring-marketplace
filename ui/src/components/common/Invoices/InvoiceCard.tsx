import React from "react";
import { useHistory, useRouteMatch } from "react-router-dom";

import Exit from "../../../assets/Exit.svg";
import {
  daysLeftFromDateString,
  decimalToPercentString,
  formatAsCurrency,
} from "../../common/utils";
import { OutlineButton } from "../OutlineButton/OutlineButton";
import { SolidButton } from "../SolidButton/SolidButton";

import "./InvoiceCard.css";

export enum InvoiceStatusEnum {
  Live = "Live",
  Open = "Open",
  Sold = "Sold",
  Paid = "Paid",
}

export interface InvoiceCardProps {
  invoiceStatus: InvoiceStatusEnum;
  invoiceNumber: string;
  payerName: string;
  minProceedings?: string;
  issuedDate: string;
  invoiceAmount: string;
  paymentDueDate: string;
  bestBidAmount?: string;
  bestDiscountRate?: string;
  auctionEndDate?: string;
  auctionSoldDate?: string;
  auctionPaidDate?: string;
  numberOfBids?: string;
  quantityFilled?: string;
  totalProceeds?: string;
  invoiceCid: any;
  auctionCid: any;
  onSendToAuction: (contractId) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = (props: InvoiceCardProps) => {
  const history = useHistory();
  const { path } = useRouteMatch();
  const {
    invoiceAmount,
    invoiceNumber,
    payerName,
    minProceedings,
    issuedDate,
    paymentDueDate,
    auctionEndDate,
    auctionSoldDate,
    bestBidAmount,
    bestDiscountRate,
    auctionPaidDate,
    numberOfBids,
    quantityFilled,
    totalProceeds,
  } = props;
  const invoiceStatus = props.invoiceStatus.toString();

  const invoiceStatusLabel = () => {
    switch (props.invoiceStatus) {
      case InvoiceStatusEnum.Live: {
        return "Auction End";
      }
      case InvoiceStatusEnum.Paid:
      case InvoiceStatusEnum.Sold: {
        return "Sold at";
      }
    }
  };

  const invoiceStatusData = () => {
    switch (props.invoiceStatus) {
      case InvoiceStatusEnum.Live: {
        return daysLeftFromDateString(new Date(auctionEndDate));
      }
      case InvoiceStatusEnum.Paid: {
        return new Date(auctionPaidDate).toLocaleDateString();
      }
      case InvoiceStatusEnum.Sold: {
        return new Date(auctionSoldDate).toLocaleDateString();
      }
    }
  };

  const InvoiceCardField = (name, label, data) => (
    <div className={`${name}`}>
      <div className={`data-label ${name}-label`}>{label}</div>
      <div className={`data-text ${name}-data`}>{data}</div>
    </div>
  );

  return (
    <div className={`invoice-card invoice-card-status-${invoiceStatus}`}>
      <div className="invoice-card-invoice-info-area">
        <div
          className={`invoice-status-indicator invoice-status-${invoiceStatus}`}
        >
          {invoiceStatus}
        </div>
        {[
          InvoiceCardField("invoice-number", "Invoice No.", invoiceNumber),
          InvoiceCardField("payer", "Payor", payerName),
          InvoiceCardField(
            "issued",
            "Issued",
            new Date(issuedDate).toLocaleDateString()
          ),
          InvoiceCardField(
            "payment-due",
            "Payment Due",
            new Date(paymentDueDate).toLocaleDateString()
          ),
          InvoiceCardField(
            "invoice-amount",
            "Invoice Amount",
            formatAsCurrency(invoiceAmount)
          ),
        ]}
        {props.invoiceStatus !== InvoiceStatusEnum.Open &&
          props.minProceedings !== null &&
          InvoiceCardField(
            "discount",
            "Min Proceedings",
            formatAsCurrency(minProceedings)
          )}
      </div>

      <div className="invoice-card-action-info-area">
        {props.invoiceStatus === InvoiceStatusEnum.Open && (
          <>
            <div className="open-auction-actions">
              <button
                className="auction-action-button"
                onClick={async () => {
                  props.onSendToAuction(props.invoiceCid);
                }}
              >
                <img
                  className="auction-action-button-icon"
                  alt=""
                  src={Exit}
                ></img>
                Send To Auction
              </button>
              <button className="auction-action-button">
                <img
                  className="auction-action-button-icon"
                  alt=""
                  src={Exit}
                ></img>
                Send To Broker
              </button>
            </div>
          </>
        )}
        {props.invoiceStatus !== InvoiceStatusEnum.Open && (
          <>
            {[
              InvoiceCardField(
                "latest-bid",
                  props.invoiceStatus !== InvoiceStatusEnum.Live
                    ? "Total Proceeds"
                    : "Best Bid",
                  props.invoiceStatus !== InvoiceStatusEnum.Live
                    ? formatAsCurrency(totalProceeds)
                    : formatAsCurrency(bestBidAmount)
              ),
              InvoiceCardField(
                "latest-discount-rate",
                "Best Discount Rate",
                bestDiscountRate
              ),
              InvoiceCardField(
                "invoice-status",
                invoiceStatusLabel(),
                invoiceStatusData()
              ),
              InvoiceCardField(
                "auction-number-of-bids",
                "Number of Bids",
                numberOfBids ?? 0
              ),
              InvoiceCardField(
                "auction-quantity-filled",
                props.invoiceStatus !== InvoiceStatusEnum.Live
                  ? "Filled Amount"
                  : "Bids Total",
                formatAsCurrency(quantityFilled)
              ),
              <div className={`view-bids`}>
                <div className={`data-label view-bids-label`}></div>
                <OutlineButton
                  label="View Bids"
                  className={`data-text view-bids-data view-bids-button`}
                  onClick={() =>
                    history.push(
                      `${path.substring(0, path.lastIndexOf("/"))}/auctions/${
                        props.auctionCid
                      }`
                    )
                  }
                />
              </div>,
            ]}
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceCard;
