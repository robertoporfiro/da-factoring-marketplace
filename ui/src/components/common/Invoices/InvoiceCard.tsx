import React from "react";

import Exit from "../../../assets/Exit.svg";
import {
  daysLeftFromDateString,
  decimalToPercentString,
  formatAsCurrency,
} from "../../common/utils";
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
  discountRate?: string;
  issuedDate: string;
  invoiceAmount: string;
  paymentDueDate: string;
  bestBidAmount?: string;
  bestDiscountRate?: string;
  latestBidAmount?: string;
  latestDiscountRate?: string;
  auctionEndDate?: string;
  auctionSoldDate?: string;
  auctionPaidDate?: string;
  contractId: any;
  onSendToAuction: (contractId) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = (props: InvoiceCardProps) => {
  const {
    invoiceAmount,
    invoiceNumber,
    payerName,
    discountRate,
    issuedDate,
    paymentDueDate,
    latestBidAmount,
    auctionEndDate,
    latestDiscountRate,
    auctionSoldDate,
    bestBidAmount,
    bestDiscountRate,
    auctionPaidDate,
  } = props;
  const invoiceStatus = props.invoiceStatus.toString();

  const discountStatusLabel = () => {
    switch (props.invoiceStatus) {
      case InvoiceStatusEnum.Live: {
        return "Latest Discount Rate";
      }
      case InvoiceStatusEnum.Sold: {
        return "Best Discount Rate";
      }
      case InvoiceStatusEnum.Paid: {
        return "Best Discount Rate";
      }
    }
  };

  const bidStatusLabel = () => {
    switch (props.invoiceStatus) {
      case InvoiceStatusEnum.Live: {
        return "Latest Bid";
      }
      case InvoiceStatusEnum.Sold: {
        return "Best Bid";
      }
      case InvoiceStatusEnum.Paid: {
        return "Best Bid";
      }
    }
  };

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

  const bidStatusData = () => {
    switch (props.invoiceStatus) {
      case InvoiceStatusEnum.Live: {
        return formatAsCurrency(latestBidAmount);
      }
      case InvoiceStatusEnum.Paid:
      case InvoiceStatusEnum.Sold: {
        return formatAsCurrency(bestBidAmount);
      }
    }
  };

  const discountStatusData = () => {
    switch (props.invoiceStatus) {
      case InvoiceStatusEnum.Live: {
        return latestDiscountRate;
      }
      case InvoiceStatusEnum.Paid:
      case InvoiceStatusEnum.Sold: {
        return bestDiscountRate;
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
          InvoiceCardField("payer", "Payer", payerName),
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
          props.discountRate !== null &&
          InvoiceCardField("discount", "Discount", discountRate)}
      </div>

      <div className="invoice-card-action-info-area">
        {props.invoiceStatus === InvoiceStatusEnum.Open && (
          <>
            <div className="open-auction-actions">
              <button
                className="auction-action-button"
                onClick={async () => {
                  props.onSendToAuction(props.contractId);
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
              InvoiceCardField("latest-bid", "Best Bid", bidStatusData()),
              discountStatusData() &&
                InvoiceCardField(
                  "latest-discount-rate",
                  "Best Discount Rate",
                  discountStatusData()
                ),
              InvoiceCardField(
                "invoice-status",
                invoiceStatusLabel(),
                invoiceStatusData()
              ),
              InvoiceCardField("auction-number-of-bids", "Bids", 20),
              InvoiceCardField(
                "auction-quantity-filled",
                "Filled Amount",
                formatAsCurrency(20000)
              ),
              <div className={`view-bids`}>
                <div className={`data-label view-bids-label`}></div>
                <SolidButton
                  label="View Bids"
                  className={`data-text view-bids-data view-bids-button`}
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
